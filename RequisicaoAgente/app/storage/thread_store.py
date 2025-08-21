# app/storage/thread_store.py
from pathlib import Path
import json
from typing import Dict, Optional

class ThreadStore:
    def __init__(self, path: str = ".orchestrate_threads.json"):
        self._path = Path(path)
        self._data: Dict[str, str] = {}
        if self._path.exists():
            try:
                self._data = json.loads(self._path.read_text(encoding="utf-8"))
            except Exception:
                self._data = {}

    def get(self, agent_id: str) -> Optional[str]:
        return self._data.get(agent_id)

    def set(self, agent_id: str, thread_id: str) -> None:
        self._data[agent_id] = thread_id
        self._path.write_text(json.dumps(self._data, ensure_ascii=False, indent=2), encoding="utf-8")
