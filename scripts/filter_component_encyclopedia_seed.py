#!/usr/bin/env python3
"""Filter component_encyclopedia_seed.csv to remove rows with short descriptions (<50 chars).
Writes filtered CSV to scripts/component_encyclopedia_seed.filtered.csv
"""
import csv
from pathlib import Path

IN = Path(__file__).parent / 'component_encyclopedia_seed.csv'
OUT = Path(__file__).parent / 'component_encyclopedia_seed.filtered.csv'

if not IN.exists():
    print(f"Input CSV not found: {IN}")
    raise SystemExit(1)

rows = []
with IN.open(newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for r in reader:
        desc = (r.get('description') or '').strip()
        if len(desc) >= 50:
            rows.append(r)

if not rows:
    print('No rows passed the filter (>=50 chars). Aborting write.')
    raise SystemExit(2)

with OUT.open('w', newline='', encoding='utf-8') as f:
    writer = csv.DictWriter(f, fieldnames=rows[0].keys())
    writer.writeheader()
    for r in rows:
        writer.writerow(r)

print(f'Wrote {len(rows)} rows to {OUT}')
