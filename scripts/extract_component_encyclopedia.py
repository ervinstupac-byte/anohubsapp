#!/usr/bin/env python3
"""
scans HTML files under docs/ and public/ for likely component definition/function blocks
and emits a CSV suitable for bulk import into component_encyclopedia.

Usage:
  python scripts/extract_component_encyclopedia.py --out scripts/component_encyclopedia_seed.csv

This script is intentionally conservative: it looks for headings near keywords like
"Definition","Function","Purpose" and captures the following paragraph(s).
"""
import argparse
import csv
import os
import re
from bs4 import BeautifulSoup


def extract_from_html(path):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        txt = f.read()
    soup = BeautifulSoup(txt, 'html.parser')
    candidates = []
    # find headings
    for h in soup.find_all(re.compile('^h[1-6]$')):
        htext = h.get_text(separator=' ').strip()
        if re.search(r'\b(Definition|Function|Purpose|Description)\b', htext, re.I):
            # grab following siblings paragraphs
            desc = []
            for sib in h.find_next_siblings():
                if sib.name and re.match('^h[1-6]$', sib.name):
                    break
                if sib.name == 'p':
                    desc.append(sib.get_text(separator=' ').strip())
            if desc:
                candidates.append((htext, '\n\n'.join(desc)))
    # fallback: look for <p> with leading 'Definition:' or 'Function:'
    for p in soup.find_all('p'):
        ptext = p.get_text(separator=' ').strip()
        m = re.match(r'^(Definition|Function|Purpose):\s*(.+)', ptext, re.I)
        if m:
            candidates.append((m.group(1), m.group(2)))
    return candidates


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='docs', help='root folder to scan (default: docs)')
    parser.add_argument('--out', default='scripts/component_encyclopedia_seed.csv')
    args = parser.parse_args()

    rows = []
    for root, _, files in os.walk(args.root):
        for fn in files:
            if not fn.lower().endswith('.html'): continue
            path = os.path.join(root, fn)
            cand = extract_from_html(path)
            for title, desc in cand:
                # create a best-effort component_name from filename + title
                base = os.path.splitext(os.path.basename(path))[0]
                comp = f"{base}:{title}"[:200]
                rows.append({'component_name': comp, 'description': desc, 'physics_principle': '', 'common_failure_modes': '[]'})

    with open(args.out, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['component_name', 'description', 'physics_principle', 'common_failure_modes']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print(f'Wrote {len(rows)} rows to {args.out}')


if __name__ == '__main__':
    main()
