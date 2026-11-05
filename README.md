# Nominal Shift Atlas

A bilingual corpus explorer for English nominalization and Chinese verbalization in film subtitles.

**Live site:** https://yeung-lok-chi.github.io/nvatwlas-test/

## What is included

- 500 traceable English–Chinese sentence pairs from OpenSubtitles v2024 via NV Atlas
- Keyword search, category filtering, human-check status, and audit-sample filtering
- URL-persisted search state for shareable views
- Four linked views: nominal–verbal network, category treemap, bilingual KWIC, and evidence table
- Interactive network controls for top-term count and minimum link weight
- Sortable data grid with filtered CSV export
- English / Traditional Chinese interface
- Learning report, five-category codebook, and AI-use declaration

## Run locally

```bash
python3 -m http.server 4173
```

Open <http://localhost:4173/>.

## Rebuild and audit the data

```bash
python3 scripts/build_corpus.py
python3 scripts/audit_corpus.py
```

`build_corpus.py` validates the raw CSV and regenerates `data/corpus.json`.
`audit_corpus.py` reconciles the 500 records against the public NV Atlas search payload and writes `data/audit.json`.

## Data and verification status

The raw supplied CSV is `NVAtlas-AI-Agent.csv` and is left unchanged. The website dataset adds the required fields, five documented categories, and a fixed 50-record programmatic audit sample.

All 500 IDs were found in the public NV Atlas record set. There are 343 exact pair matches and 481 matches after Unicode NFKC and whitespace normalization. The remaining 19 variants are retained and documented rather than silently corrected.

The fixed 50-record audit sample still requires the student's personal review. `human_checked` remains `false` for every record until that review is completed; programmatic reconciliation is not represented as human verification.

## Source and attribution

- NV Atlas: https://nvatlas.tra.cuhk.edu.hk/
- Public record set used for reconciliation: https://nvatlas.tra.cuhk.edu.hk/search.html
- Upstream corpus: OpenSubtitles v2024
- Institution: Department of Translation, The Chinese University of Hong Kong

The site displays short subtitle excerpts. Reuse of the source text remains subject to the upstream OpenSubtitles and NV Atlas terms.

## Project context

Built for **2026R1 Translation Technology in the Age of AI**, final project, due 5 December 2026.
