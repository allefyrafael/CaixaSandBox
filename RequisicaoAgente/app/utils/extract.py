# app/utils/extract.py
from typing import Dict, List

def extract_texts(run_json: Dict) -> List[str]:
    out: List[str] = []
    msg = (run_json.get("result", {}) or {}).get("data", {}) or {}
    msg = msg.get("message", {}) or {}
    content = msg.get("content")
    if isinstance(content, list):
        for c in content:
            if isinstance(c, dict) and c.get("response_type") == "text":
                t = (c.get("text") or "").strip()
                if t:
                    out.append(t)
    else:
        t = (msg.get("content") or "").strip()
        if t:
            out.append(t)
    return out
