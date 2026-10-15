"""Read only the current CI simulator's synthetic native AES result; no console inference."""
import json
import re
import sqlite3
import sys
import time
from pathlib import Path


def read_result(directory, probe_id):
    if not re.fullmatch(r"\d+-\d+", probe_id):
        raise ValueError("Invalid smoke probe identifier")
    paths = list(Path(directory).rglob("native-crypto-smoke.db"))
    if len(paths) > 1:
        raise ValueError("Ambiguous smoke result")
    if not paths:
        return None
    try:
        with sqlite3.connect(paths[0].resolve().as_uri() + "?mode=ro", uri=True, timeout=1) as db:
            row = db.execute("SELECT status FROM native_crypto_smoke WHERE probe_id=? AND version=1", (probe_id,)).fetchone()
        if not row:
            return None
        if row[0] not in ("passed", "failed"):
            raise ValueError("Invalid smoke result")
        return row[0]
    except sqlite3.OperationalError:
        return None


def main():
    directory, probe_id = sys.argv[1:]
    for _ in range(30):
        status = read_result(directory, probe_id)
        if status == "failed":
            raise SystemExit("Native AES-GCM preflight failed")
        if status == "passed":
            result = {"version": 1, "probe_id": probe_id, "status": "passed", "checks": ["native AES-GCM roundtrip", "hex key import", "base64 to bytes", "mismatched AAD rejected"]}
            output = Path("build/ios/native-crypto-result.json")
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(json.dumps(result, indent=2) + "\n")
            print("Native AES-GCM and AAD rejection: PASS")
            return
        time.sleep(1)
    raise SystemExit("No matching native AES-GCM result; acceptance not proven")


if __name__ == "__main__":
    main()
