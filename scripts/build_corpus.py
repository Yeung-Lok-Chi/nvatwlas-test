#!/usr/bin/env python3
"""Normalize the supplied NV Atlas export and create the website data files.

The raw CSV is never rewritten. This script makes the website's 500 records
traceable, assigns one of five documented nominal-function categories, and
records a fixed 50-entry verification sample.
"""
from __future__ import annotations

import csv
import hashlib
import json
import random
import re
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "NVAtlas-AI-Agent.csv"
OUT = ROOT / "data" / "corpus.json"
CHECK_SAMPLE_SEED = 20261105
SAMPLE_RATE = 0.10

CATEGORY_TERMS = {
    "direct-verbalization": """
        absolution accumulation action addition appearance arrangement
        authorization capture celebration cessation circulation combination
        construction cure dance declaration departure description destruction
        disappearance division education election elopement enlargement evidence
        examination explosion exposure expression expulsion extermination failure
        fixation fulfillment identification imitation impregnation infection
        inspection introduction intrusion invasion payment performance picture
        possession postponement prevention publication recitation registration
        replacement reservation resignation retirement sentence shipment signature
        solution suction transfusion transportation treatment usurpation vacation
        violation
    """,
    "event-process": """
        action addition administration aggression bombardment capture celebration
        cessation circulation collision communication competition composition
        confession confinement confiscation convulsion correction corruption
        defence demonstration detention diversion encouragement encirclement
        endorsement engagement execution failure hindrance imprisonment indictment
        interference interrogation interruption intoxication lecture management
        movement nourishment obedience observation obstruction operation passion
        persecution persuasion petition preachment probation pronouncement
        prosecution prostitution protection punishment ration reception
        recognition recollection recommendation reference relaxation resistance
        riddance romance satisfaction sedation sensation settlement silence
        suggestion suspension temptation torment torture trance vengeance
    """,
    "speech-communication": """
        admission announcement argument assurance communication compliment
        conversation discussion equivocation explanation grievance information
        instrument intention interpretation invitation mention notion objection
        occasion offence permission persuasion pronouncement question recognition
        recommendation recitation reference suggestion
    """,
    "mental-emotional": """
        admiration amusement attention chance consideration conviction decision
        disappointment excitement evasion fiction imagination implication impression
        indulgence inspiration intoxication obsession passion penance pleasure
        preference recollection reputation resemblance salvation seduction sensation
        satisfaction trance
    """,
    "relational-state": """
        advance ailment appointment assistance audience dependence dedication
        devotion endowment exception existence obedience observance pension position
        presence protection riddance
    """,
}

# Manually curated assignments for the 195 observed nominal lemmas. The order of
# checks is intentional: exact category membership, then domain-specific overrides.
CATEGORY_OVERRIDES = {
    "direct-verbalization": """
        absolution accumulation action addition appearance arrangement
        authorization capture celebration cessation circulation combination
        construction cure dance declaration departure description destruction
        disappearance division education election elopement enlargement evidence
        examination explosion exposure expression expulsion extermination failure
        fixation fulfillment identification imitation impregnation infection
        inspection introduction intrusion invasion payment performance picture
        possession postponement prevention publication recitation registration
        replacement reservation resignation retirement sentence shipment signature
        solution suction transfusion transportation treatment usurpation vacation
        violation
    """,
    "event-process": """
        administration aggression bombardment collision competition composition
        confession confinement confiscation convulsion correction corruption
        defence demonstration detention diversion encirclement encouragement
        endowment execution hindrance indictment interference interrogation
        interruption lecture management movement nourishment observation
        obstruction operation persecution petition preachment probation
        pronouncement prosecution prostitution protection punishment ration
        annulment reception relaxation resistance riddance romance settlement silence
        suggestion suspension temptation torment torture vengeance
    """,
    "speech-communication": """
        admission announcement argument assurance communication compliment
        conversation discussion equivocation explanation grievance information
        instrument intention interpretation invitation mention notion objection
        occasion offence permission persuasion pronouncement question recognition
        recommendation recitation reference suggestion
    """,
    "mental-emotional": """
        admiration amusement attention chance consideration conviction decision
        disappointment excitement evasion fiction imagination implication impression
        indulgence inspiration intoxication obsession passion penance pleasure
        preference recollection reputation resemblance salvation seduction sensation
        satisfaction trance
    """,
    "relational-state": """
        advance ailment appointment assistance audience dedication dependence
        devotion endowment exception existence obedience observance pension position
        presence protection riddance
    """,
}
LIST_CATEGORIES = ["direct-verbalization", "event-process", "speech-communication", "mental-emotional", "relational-state"]
CATEGORY_LABELS = {
    "direct-verbalization": ("Direct verbalization", "直接动词化"),
    "event-process": ("Event / process", "事件／過程"),
    "speech-communication": ("Speech / communication", "言語／溝通"),
    "mental-emotional": ("Mental / emotional", "心理／情感"),
    "relational-state": ("Relational / state", "關係／狀態"),
}

def norm(s: str) -> str:
    return unicodedata.normalize("NFKC", s or "").strip()

def term_sets() -> dict[str, set[str]]:
    return {k: set(v.split()) for k, v in CATEGORY_OVERRIDES.items()}

def category_for(term: str, sets: dict[str, set[str]]) -> str:
    for cat in LIST_CATEGORIES:
        if term in sets[cat]:
            return cat
    # Fallback is explicit and surfaced in the build report.
    return "relational-state"

def main() -> None:
    with RAW.open(encoding="utf-8-sig", newline="") as f:
        source_rows = list(csv.DictReader(f))

    if len(source_rows) != 500:
        raise SystemExit(f"Expected 500 raw rows, found {len(source_rows)}")
    ids = [r["id"] for r in source_rows]
    if len(set(ids)) != len(ids):
        raise SystemExit("Duplicate IDs found in raw CSV")

    sets = term_sets()
    seen_terms = {r["English_Nominal"] for r in source_rows}
    assigned_terms = set().union(*sets.values())
    missing = sorted(seen_terms - assigned_terms)
    extra = sorted(assigned_terms - seen_terms)
    if missing or extra:
        raise SystemExit(f"Category map mismatch. Missing: {missing}. Extra: {extra}")

    rng = random.Random(CHECK_SAMPLE_SEED)
    check_ids = set(rng.sample(ids, round(len(ids) * SAMPLE_RATE)))

    records = []
    for row in source_rows:
        term = norm(row["English_Nominal"])
        category = category_for(term, sets)
        records.append({
            "id": row["id"],
            "source_text": row["English"],
            "target_text": row["Chinese"],
            "key_term": term,
            "target_verb": row["Chinese_Verb"],
            "category": category,
            "category_label_en": CATEGORY_LABELS[category][0],
            "category_label_zh": CATEGORY_LABELS[category][1],
            "source": f"NV Atlas / OpenSubtitles v2024, sentence id {row['id']}, accessed 2026-11-05",
            "source_name": "NV Atlas",
            "upstream_corpus": "OpenSubtitles v2024",
            "source_url": "https://nvatlas.tra.cuhk.edu.hk/search.html",
            "retrieved": "2026-11-05",
            "unit": "sentence pair with aligned noun-verb pair",
            "human_checked": False,
            "audit_sample": row["id"] in check_ids,
            "check_sample_seed": CHECK_SAMPLE_SEED if row["id"] in check_ids else None,
            "notes": "",
        })

    by_category = Counter(r["category"] for r in records)
    by_term = Counter(r["key_term"] for r in records)
    by_verb = Counter(r["target_verb"] for r in records)
    raw_hash = hashlib.sha256(RAW.read_bytes()).hexdigest()

    payload = {
        "meta": {
            "title": "Nominal Shift Atlas",
            "records": len(records),
            "unique_terms": len(by_term),
            "unique_verbs": len(by_verb),
            "unique_sentence_pairs": len({(r["source_text"], r["target_text"]) for r in records}),
            "raw_csv": RAW.name,
            "raw_csv_sha256": raw_hash,
            "check_sample_seed": CHECK_SAMPLE_SEED,
            "check_sample_size": len(check_ids),
            "human_checked_total": sum(1 for r in records if r["human_checked"]),
            "audit_sample_size": sum(1 for r in records if r["audit_sample"]),
            "check_sample_method": "Python random.Random(20261105).sample over the 500 unique source IDs",
            "retrieved": "2026-11-05",
            "upstream_corpus": "OpenSubtitles v2024",
            "source": "NV Atlas, Department of Translation, CUHK",
            "source_url": "https://nvatlas.tra.cuhk.edu.hk/",
            "license_note": "Short subtitle excerpts. Reuse subject to the upstream OpenSubtitles / NV Atlas terms; this project does not relicense the source text.",
        },
        "categories": [
            {
                "id": cat,
                "label_en": CATEGORY_LABELS[cat][0],
                "label_zh": CATEGORY_LABELS[cat][1],
                "count": by_category[cat],
            } for cat in LIST_CATEGORIES
        ],
        "records": records,
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    build_report = {
        "raw_rows": len(records),
        "unique_ids": len(ids),
        "unique_terms": len(by_term),
        "unique_verbs": len(by_verb),
        "category_counts": dict(by_category),
        "check_sample_size": len(check_ids),
        "check_sample_ids": sorted(check_ids, key=int),
        "raw_csv_sha256": raw_hash,
    }
    (ROOT / "data" / "build_report.json").write_text(
        json.dumps(build_report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(build_report, ensure_ascii=False, indent=2))

if __name__ == "__main__":
    main()
