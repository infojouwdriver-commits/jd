"""Collect only this synthetic app's recent boot diagnostics; never dump runner env."""
from pathlib import Path
import re
import time
out = Path('build/ios')
out.mkdir(parents=True, exist_ok=True)
chunks = []
console = out / 'simulator-console.raw'
if console.exists():
    chunks.append(console.read_text(errors='replace')[-120000:])
for folder in [Path.home() / 'Library/Logs/DiagnosticReports', Path.home() / 'Library/Logs/CrashReporter']:
    for path in folder.glob('JOUWDRIVER*'):
        if path.is_file() and time.time() - path.stat().st_mtime < 300:
            chunks.append(path.read_text(errors='replace')[:120000])
text = '\n\n'.join(chunks) or 'No application console or recent crash report was captured.'
text = re.sub(r'\b(?:pk|sk)\.[A-Za-z0-9._-]+', '[redacted-map-token]', text)
text = re.sub(r'(?i)(authorization|cookie|client_secret|access_token|refresh_token)([\s:=]+)[^\s,;]+', r'\1\2[redacted]', text)
(out / 'simulator-diagnostics.txt').write_text(text)
if console.exists():
    console.unlink()
