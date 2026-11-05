#!/usr/bin/env python3
"""Reconcile the website corpus against the public NV Atlas search payload.

This is a reproducibility aid, not a claim that the upstream service is an
archival API. It downloads the public page, extracts its embedded DATA object,
and reports exact and compatibility-normalized matches.
"""
from __future__ import annotations

import json
import re
import unicodedata
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data" / "corpus.json"
AUDIT = ROOT / "data" / "audit.json"
URL = "https://nvatlas.tra.cuhk.edu.hk/search.html"

def normalize(text: str) -> str:
    text = unicodedata.normalize("NFKC", text or "")
    return re.sub(r"\s+", " ", text).strip()

def main() -> None:
    payload = json.loads(DATA.read_text(encoding="utf-8"))
    html = urllib.request.urlopen(URL, timeout=30).read().decode("utf-8", "replace")
    match = re.search(r"const DATA = (\{.*?\});\s*\n\s*const SPELLING_CANONICAL", html, re.S)
    if not match:
        raise SystemExit("Could not locate the public DATA object")
    public = json.loads(match.group(1))
    records = {}
    for sentence in public["SENTS"]:
        for sentence_id in sentence["ids"]:
            records[str(sentence_id)] = sentence

    missing, exact, normalized, variants = [], 0, 0, []
    for row in payload["records"]:
        source = records.get(row["id"])
        if source is None:
            missing.append(row["id"])
            continue
        en_ok = row["source_text"] == source["en"]
        zh_ok = row["target_text"] == source["zh"]
        exact += en_ok and zh_ok
        norm_ok = normalize(row["source_text"]) == normalize(source["en"]) and normalize(row["target_text"]) == normalize(source["zh"])
        normalized += norm_ok
        if not norm_ok:
            variants.append({
                "id": row["id"],
                "source_exact": en_ok,
                "target_exact": zh_ok,
                "source_normalized": normalize(row["source_text"]) == normalize(source["en"]),
                "target_normalized": normalize(row["target_text"]) == normalize(source["zh"]),
                "published_source": source["en"],
                "published_target": source["zh"],
                "site_source": row["source_text"],
                "site_target": row["target_text"],
            })

    checked_ids = {r["id"] for r in payload["records"] if r["audit_sample"]}
    checked = [r for r in payload["records"] if r["id"] in checked_ids]
    sample_missing = [r["id"] for r in checked if r["id"] not in records]
    sample_exact = sum(
        r["source_text"] == records[r["id"]]["en"] and r["target_text"] == records[r["id"]]["zh"]
        for r in checked if r["id"] in records
    )
    sample_normalized = sum(
        normalize(r["source_text"]) == normalize(records[r["id"]]["en"])
        and normalize(r["target_text"]) == normalize(records[r["id"]]["zh"])
        for r in checked if r["id"] in records
    )
    audit = {
        "public_source": URL,
        "retrieved": "2026-11-05",
        "records_checked": len(payload["records"]),
        "records_found": len(payload["records"]) - len(missing),
        "missing_ids": missing,
        "exact_pair_matches": exact,
        "normalized_pair_matches": normalized,
        "variants": variants,
        "audit_sample_size": len(checked),
        "audit_sample_missing_ids": sample_missing,
        "audit_sample_exact_matches": sample_exact,
        "audit_sample_normalized_matches": sample_normalized,
        "note": "Normalized matches apply Unicode NFKC and whitespace normalization only. Variants are retained in the site data; no source text was silently rewritten.",
    }
    AUDIT.write_text(json.dumps(audit, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({k: v for k, v in audit.items() if k not in {"variants"}}, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
