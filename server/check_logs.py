import urllib.request, json, sys

url = 'https://www.emprendesalud.net/api/waha/logs?key=ES-leads-2026-Xk9Qm2Pv'
try:
    with urllib.request.urlopen(url, timeout=15) as resp:
        data = json.loads(resp.read())
    for l in data.get('logs', [])[:20]:
        print(f"{l['created_at']} | {l['direction']:>3} | {l['text'][:140]}")
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)
