# app/storage/conversation_logger.py
from pathlib import Path
import json
from typing import Dict, List

class ConversationLogger:
    def __init__(self, base_dir: str = "./conversas"):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def append_run(self, thread_id: str, run_json: Dict) -> None:
        file_path = self.base_dir / f"conversa_{thread_id}.json"
        data: List[Dict] = []
        if file_path.exists():
            try:
                data = json.loads(file_path.read_text(encoding="utf-8"))
            except Exception:
                data = []
        data.append(run_json)
        file_path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
