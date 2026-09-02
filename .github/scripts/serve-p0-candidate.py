#!/usr/bin/env python3
"""Deterministic static candidate server for the pre-deploy P0 browser gate.

The production page requests /api/checkout-qr from the Cloudflare Worker. The
pre-deploy browser job serves ./docs only, so that one production API contract
needs a deterministic local fixture instead of a fake 404. Worker API behavior
is validated separately by the production Worker tests and live smoke checks.
"""
from __future__ import annotations

import argparse
import html
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

PLANS = {"business_lite", "business_pro", "technician_team"}


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        parsed = urlparse(self.path)
        if parsed.path == "/api/checkout-qr":
            query = parse_qs(parsed.query)
            plan = (query.get("plan") or [""])[0]
            if plan not in PLANS:
                self.send_error(400, "Unsupported plan")
                return
            label = html.escape(plan)
            svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160" role="img" aria-label="{label} checkout QR fixture">
<rect width="160" height="160" fill="#fff"/>
<rect x="12" y="12" width="40" height="40" fill="#06131d"/><rect x="108" y="12" width="40" height="40" fill="#06131d"/><rect x="12" y="108" width="40" height="40" fill="#06131d"/>
<path d="M68 18h16v16H68zM88 38h16v16H88zM64 62h24v12H64zM98 66h18v18H98zM66 86h14v22H66zM84 88h18v14H84zM108 102h18v18h-18zM78 118h18v18H78zM104 132h24v16h-24z" fill="#06131d"/>
</svg>'''.encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "image/svg+xml; charset=utf-8")
            self.send_header("Content-Length", str(len(svg)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-FormatX-P0-Fixture", "checkout-qr")
            self.end_headers()
            self.wfile.write(svg)
            return
        super().do_GET()

    def log_message(self, fmt, *args):
        print(f"P0_HTTP {self.address_string()} {fmt % args}", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=4178)
    parser.add_argument("--root", default="docs")
    args = parser.parse_args()
    root = os.path.abspath(args.root)
    os.chdir(root)
    server = ThreadingHTTPServer(("127.0.0.1", args.port), Handler)
    print(f"FormatX P0 candidate server: http://127.0.0.1:{args.port}/ from {root}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
