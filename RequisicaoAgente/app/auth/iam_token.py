# app/auth/iam_token.py
import time
import requests
from typing import Optional
from app.config import IAM_URL, IBM_CLOUD_API_KEY

class IAMTokenManager:
    def __init__(self, api_key: str = IBM_CLOUD_API_KEY):
        self.api_key = api_key
        self._token: Optional[str] = None
        self._exp_epoch: float = 0.0

    def _fetch(self) -> None:
        r = requests.post(
            IAM_URL,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            data={
                "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
                "apikey": self.api_key,
            },
            timeout=30,
        )
        if not r.ok:
            raise RuntimeError(f"IAM {r.status_code}: {r.text}")

        data = r.json()
        self._token = data["access_token"]
        if "expiration" in data:
            self._exp_epoch = float(data["expiration"]) - 30
        else:
            self._exp_epoch = time.time() + float(data.get("expires_in", 3600)) - 30

    def get(self) -> str:
        now = time.time()
        if not self._token or now >= self._exp_epoch:
            self._fetch()
        return self._token
