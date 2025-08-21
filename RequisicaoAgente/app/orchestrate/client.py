# app/orchestrate/client.py
import time
import json
import requests
from typing import Dict, List, Optional, Tuple
from app.config import BASE_URL
from app.auth.iam_token import IAMTokenManager
from app.storage.thread_store import ThreadStore
from app.storage.conversation_logger import ConversationLogger

class OrchestrateClient:
    def __init__(self, agent_id: str, token_manager: IAMTokenManager, store: ThreadStore, logger: ConversationLogger):
        self.base_url = BASE_URL.rstrip("/")
        self.agent_id = agent_id
        self.token_manager = token_manager
        self.store = store
        self.logger = logger

    def _auth_header(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.token_manager.get()}",
            "Content-Type": "application/json",
        }

    def create_run(
        self,
        message: Optional[Dict[str, str]] = None,
        messages: Optional[List[Dict[str, str]]] = None,
        thread_id: Optional[str] = None,
    ) -> Tuple[str, str]:
        """
        Cria um run e retorna (run_id, thread_id_resolvido).

        Validações:
        - Se 'messages' for usado: deve existir pelo menos UMA entrada com role='user'.
        - Se 'message' for usado: role deve ser 'user'. (Conteúdo pode ser vazio; quem decide é o agente.)
        """
        if (message is None) and (not messages):
            raise ValueError("Forneça 'message' OU 'messages'.")

        payload = {"agent_id": self.agent_id}
        if thread_id:
            payload["thread_id"] = thread_id

        if messages is not None:
            has_user = any((m.get("role") == "user") for m in messages)
            if not has_user:
                raise ValueError("Inclua ao menos uma mensagem de usuário em 'messages'.")
            payload["messages"] = messages
        else:
            if message.get("role") != "user":
                raise ValueError("A primeira mensagem deve vir do usuário ('role': 'user').")
            # NÃO validamos conteúdo vazio aqui — o agente define a semântica.
            payload["message"] = message

        url = f"{self.base_url}/orchestrate/runs"
        resp = requests.post(url, headers=self._auth_header(), json=payload, timeout=60)
        if not resp.ok:
            raise RuntimeError(f"POST {url} -> {resp.status_code}: {resp.text}")

        body = resp.json()
        run_id = body.get("run_id")
        if not run_id:
            raise RuntimeError(f"Resposta inesperada ao criar run: {resp.text}")

        # Resolve thread_id pelo GET do run
        run_json = self.get_run(run_id)
        thread_id_resolved = run_json.get("thread_id") or thread_id or ""
        if thread_id_resolved:
            self.store.set(self.agent_id, thread_id_resolved)

        # Loga o run recém-criado (estado do GET inicial)
        self.logger.append_run(thread_id_resolved, run_json)
        return run_id, thread_id_resolved

    def get_run(self, run_id: str) -> Dict:
        url = f"{self.base_url}/orchestrate/runs/{run_id}"
        resp = requests.get(url, headers=self._auth_header(), timeout=60)
        if not resp.ok:
            raise RuntimeError(f"GET {url} -> {resp.status_code}: {resp.text}")
        return resp.json()

    def wait_run(self, run_id: str, timeout_s: float = 90.0, poll_interval: float = 1.0) -> Dict:
        url = f"{self.base_url}/orchestrate/runs/{run_id}"
        start = time.time()
        while True:
            resp = requests.get(url, headers=self._auth_header(), timeout=60)
            if not resp.ok:
                raise RuntimeError(f"GET {url} -> {resp.status_code}: {resp.text}")
            data = resp.json()
            status = data.get("status")
            if status in {"completed", "failed", "cancelled"}:
                return data
            if time.time() - start > timeout_s:
                raise TimeoutError(f"Run {run_id} não concluiu em {timeout_s}s (status={status})")
            time.sleep(poll_interval)

    def send_sequence(self, user_messages: List[str], start_new_thread: bool = False) -> List[Dict]:
        if not user_messages:
            raise ValueError("Liste ao menos uma mensagem.")
        thread_id = None if start_new_thread else self.store.get(self.agent_id)
        results: List[Dict] = []

        for text in user_messages:
            msg = {"role": "user", "content": text}
            run_id, thread_id = self.create_run(message=msg, thread_id=thread_id)
            run_json = self.wait_run(run_id)
            results.append(run_json)
            # Loga também após o GET final (garante status final)
            self.logger.append_run(thread_id, run_json)
        return results
