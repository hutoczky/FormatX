#!/usr/bin/env python3
from __future__ import annotations

import importlib.util
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE_VALIDATOR = ROOT / "tools" / "validate-site-i18n.py"

spec = importlib.util.spec_from_file_location("formatx_i18n_base", BASE_VALIDATOR)
if spec is None or spec.loader is None:
    raise RuntimeError("Could not load the FormatX bilingual validator")
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)

validator.ALLOW_EXACT.update({
    "Business Lite fizetési oldal QR-kódja",
    "Business Pro fizetési oldal QR-kódja",
    "Technician Team fizetési oldal QR-kódja",
    "Business Lite fizetés megnyitása",
    "Business Pro fizetés megnyitása",
    "Technician Team fizetés megnyitása",
    "FormatX rendszerépület",
    "01 / INDIVIDUAL",
    "02 / RECOMMENDED",
    "03 / TEAM",
    "CORE STATE",
    "FORMATX / LIVING CORE",
    "FORMATX / SENSE / PLAN / EXECUTE / VERIFY / FORMATX / SENSE / PLAN / EXECUTE / VERIFY /",
    "FormatX Suite Pro | Living System Architecture",
    "LIVING SYSTEM",
    "MAG",
    "PAYMENT ACCESS LAYER",
    "Platform",
    "QR ↗",
    "RELEASE DNA",
    "RESPONSIVE SYSTEM ARCHITECTURE",
    "SUITE PRO · LIVING ARCHITECTURE",
    "SYSTEM ORGANISM INITIALISING",
})
validator.ALLOW_PATTERNS.append(re.compile(r"^\d+(?:[.,]\d+)? € / hó$"))

if __name__ == "__main__":
    sys.exit(validator.main())
