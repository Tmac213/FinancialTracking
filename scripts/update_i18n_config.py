# scripts/update_i18n_config.py
"""Generate i18n.config.json from the language Excel file.

This script reads `World_Languages_and_Codes_ISO_Directory.xlsx` located at the project root
and produces `i18n.config.json` with entries for every language.

Run it with:
  python scripts/update_i18n_config.py

Make sure the required Python packages are installed:
  pip install pandas openpyxl
"""

import json
from pathlib import Path

import pandas as pd

# Paths relative to the project root
PROJECT_ROOT = Path(__file__).resolve().parents[1]
EXCEL_PATH = PROJECT_ROOT / "World_Languages_and_Codes_ISO_Directory.xlsx"
OUTPUT_PATH = PROJECT_ROOT / "i18n.config.json"

# The Excel sheet has the ISO code in the first column and the language name in the second column
CODE_COL = "Unnamed: 0"
LABEL_COL = "Unnamed: 1"

print(f"Reading Excel file: {EXCEL_PATH}")
# Skip the first two header rows which contain meta‑information
df = pd.read_excel(EXCEL_PATH, skiprows=2, dtype=str)

# Known RTL language codes (add more if needed)
RTL_CODES = {"ar", "he", "fa", "ur"}

languages = []
for _, row in df.iterrows():
    code = str(row.get(CODE_COL, "")).strip()
    label = str(row.get(LABEL_COL, "")).strip()
    if not code or not label:
        continue
    code_lc = code.lower()
    lang_entry = {
        "code": code_lc,
        "label": label,
        "detect": [code_lc],
        "dir": "rtl" if code_lc in RTL_CODES else "ltr",
    }
    languages.append(lang_entry)

# Ensure fallback language exists (English)
fallback = "en"
if not any(l["code"] == fallback for l in languages):
    languages.append({"code": fallback, "label": "English", "detect": [fallback], "dir": "ltr"})

config = {"version": 1, "fallbackLng": fallback, "languages": languages}

OUTPUT_PATH.write_text(json.dumps(config, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"Wrote {len(languages)} language entries to {OUTPUT_PATH}")
