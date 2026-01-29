#!/usr/bin/env python3
"""
extract_knowledge.py

Scans the repository for .html files and attempts to extract expert knowledge
entries (symptom, diagnosis, recommended_action, severity) into a JSON
suitable for insertion into `public.expert_knowledge_base`.

Usage:
    python scripts/extract_knowledge.py --source docs public --out extracted_expert_knowledge.json

Heuristics:
- Looks for headings or labels containing 'symptom', 'diagnosis', 'recommended', 'action', 'severity'
- Falls back to pattern matching like 'Symptom: ...' in text nodes
- Maps severity keywords to {LOW, MEDIUM, HIGH, CRITICAL}

"""
import argparse
import json
import re
from pathlib import Path
from typing import List, Dict, Optional

from bs4 import BeautifulSoup

SEVERITY_MAP = {
    'critical': 'CRITICAL',
    'high': 'HIGH',
    'medium': 'MEDIUM',
    'low': 'LOW'
}

def normalize_severity(text: Optional[str]) -> str:
    if not text:
        return 'MEDIUM'
    t = text.strip().lower()
    for k,v in SEVERITY_MAP.items():
        if k in t:
            return v
    # fallback: if contains '!' or 'urgent' mark as HIGH
    if 'urgent' in t or '!' in t:
        return 'HIGH'
    return 'MEDIUM'

def extract_from_html(path: Path) -> List[Dict]:
    results = []
    try:
        html = path.read_text(encoding='utf-8')
    except Exception:
        try:
            html = path.read_text(encoding='latin-1')
        except Exception:
            return results

    soup = BeautifulSoup(html, 'html.parser')

    # Collect text blocks that look promising
    text = soup.get_text(separator='\n')

    # Heuristic patterns and label synonyms
    patterns = [r"Symptom[:\s]+(.+)", r"Diagnosis[:\s]+(.+)", r"Recommended action[:\s]+(.+)", r"Recommended[:\s]+(.+)", r"Severity[:\s]+(.+)"]
    LABEL_SYNONYMS = {
        'issue': 'symptom',
        'observation': 'symptom',
        'finding': 'symptom',
        'sign': 'symptom',
        'cause': 'actual_cause',
        'root cause': 'actual_cause',
        'remedy': 'recommended_action',
        'resolution': 'recommended_action',
        'fix': 'recommended_action',
        'action': 'recommended_action'
    }

    lines = [l.strip() for l in text.splitlines() if l.strip()]

    # Attempt sliding window to capture groups: symptom -> diagnosis -> recommended
    for i, line in enumerate(lines):
        m_sym = re.search(patterns[0], line, re.IGNORECASE)
        if m_sym:
            symptom = m_sym.group(1).strip()
            diagnosis = ''
            recommended = ''
            severity = None
            # look ahead up to 8 lines
            for j in range(i+1, min(i+8, len(lines))):
                l = lines[j]
                m_diag = re.search(patterns[1], l, re.IGNORECASE)
                if m_diag and not diagnosis:
                    diagnosis = m_diag.group(1).strip()
                    continue
                m_rec = re.search(patterns[2], l, re.IGNORECASE) or re.search(patterns[3], l, re.IGNORECASE)
                if m_rec and not recommended:
                    recommended = m_rec.group(1).strip()
                    continue
                m_sev = re.search(patterns[4], l, re.IGNORECASE)
                if m_sev and not severity:
                    severity = normalize_severity(m_sev.group(1))
                # try to match label synonyms like 'Issue:', 'Resolution:'
                m_label = re.match(r'^(\w[\w\s]{1,40})[:\s]+(.+)', l)
                if m_label:
                    label = m_label.group(1).strip().lower()
                    val = m_label.group(2).strip()
                    mapped = LABEL_SYNONYMS.get(label)
                    if mapped == 'symptom' and not symptom:
                        symptom = val
                    if mapped == 'recommended_action' and not recommended:
                        recommended = val
                    if mapped == 'actual_cause' and not diagnosis:
                        diagnosis = val
                    continue
            results.append({
                'symptom_key': symptom.upper().replace(' ', '_'),
                'diagnosis': diagnosis or '',
                'recommended_action': recommended or '',
                'severity': severity or 'MEDIUM',
                'source_file': str(path)
            })

    # Heuristic 2: look for structured blocks: <h*>Symptom</h*> followed by <p>
    for header in soup.find_all(re.compile('^h[1-6]$', re.I)):
        htext = header.get_text().strip().lower()
        if 'symptom' in htext:
            symptom = ''
            diagnosis = ''
            recommended = ''
            severity = None
            # symptom could be in the next sibling paragraph
            sib = header.find_next_sibling()
            if sib:
                symptom = sib.get_text().strip()
            # find next elements for diagnosis/recommended
            for n in header.find_all_next(limit=12):
                nt = n.get_text().strip()
                low = nt.lower()
                if not diagnosis and 'diagnosis' in low:
                    diagnosis = nt.split(':',1)[-1].strip() if ':' in nt else ''
                if not recommended and ('recommended' in low or 'action' in low or 'resolution' in low or 'remedy' in low or 'fix' in low):
                    recommended = nt.split(':',1)[-1].strip() if ':' in nt else ''
                if not severity and 'severity' in low:
                    severity = normalize_severity(nt.split(':',1)[-1].strip() if ':' in nt else nt)
                # catch synonyms like 'Issue' or 'Observation'
                for syn, kind in LABEL_SYNONYMS.items():
                    if syn in low:
                        if kind == 'symptom' and not symptom:
                            symptom = nt.split(':',1)[-1].strip() if ':' in nt else nt
                        if kind == 'recommended_action' and not recommended:
                            recommended = nt.split(':',1)[-1].strip() if ':' in nt else nt
                        if kind == 'actual_cause' and not diagnosis:
                            diagnosis = nt.split(':',1)[-1].strip() if ':' in nt else nt
                if symptom and diagnosis and recommended:
                    break
            if symptom:
                results.append({
                    'symptom_key': symptom.upper().replace(' ', '_')[:60],
                    'diagnosis': diagnosis,
                    'recommended_action': recommended,
                    'severity': severity or 'MEDIUM',
                    'source_file': str(path)
                })

    # Heuristic 3: pattern-matching paragraphs for trio
    para_texts = [p.get_text().strip() for p in soup.find_all('p') if p.get_text().strip()]
    for p in para_texts:
        # if contains the words symptom and diagnosis and recommended (or synonyms)
        if re.search(r'symptom', p, re.I) or re.search(r'issue', p, re.I) or re.search(r'observation', p, re.I):
            # try to extract fields
            symptom = ''
            diagnosis = ''
            recommended = ''
            m_sym = re.search(r'Symptom[:\s]+([^\n\r;]+)', p, re.I)
            m_diag = re.search(r'Diagnosis[:\s]+([^\n\r;]+)', p, re.I)
            m_rec = re.search(r'(Recommended action|Recommended)[:\s]+([^\n\r;]+)', p, re.I)
            # additional patterns
            if not m_sym:
                m_sym = re.search(r'(Issue|Observation|Finding)[:\s]+([^\n\r;]+)', p, re.I)
            if not m_rec:
                m_rec = re.search(r'(Resolution|Remedy|Fix|Action)[:\s]+([^\n\r;]+)', p, re.I)
            if m_sym:
                # group 2 may exist for the alternative patterns
                symptom = (m_sym.group(2) if m_sym.lastindex and m_sym.lastindex >= 2 else m_sym.group(1)).strip()
            if m_diag:
                diagnosis = m_diag.group(1).strip()
            if m_rec:
                recommended = m_rec.group(2).strip()
            if symptom:
                results.append({
                    'symptom_key': symptom.upper().replace(' ', '_')[:60],
                    'diagnosis': diagnosis,
                    'recommended_action': recommended,
                    'severity': 'MEDIUM',
                    'source_file': str(path)
                })

    return results


def find_html_files(paths: List[Path]) -> List[Path]:
    files = []
    for p in paths:
        if p.is_dir():
            files.extend([f for f in p.rglob('*.html')])
        elif p.is_file() and p.suffix.lower() == '.html':
            files.append(p)
    return files


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', nargs='+', default=['docs', 'public'], help='Source directories to scan')
    parser.add_argument('--out', default='scripts/extracted_expert_knowledge.json', help='Output JSON file')
    args = parser.parse_args()

    roots = [Path(p) for p in args.source]
    files = find_html_files(roots)
    print(f'Found {len(files)} html files to scan')

    all_entries = []
    for f in files:
        entries = extract_from_html(f)
        if entries:
            all_entries.extend(entries)

    # deduplicate by symptom_key + diagnosis
    seen = set()
    unique = []
    for e in all_entries:
        key = (e['symptom_key'], e['diagnosis'])
        if key in seen: continue
        seen.add(key)
        unique.append(e)

    out_path = Path(args.out)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(unique, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'Wrote {len(unique)} entries to {out_path}')

if __name__ == '__main__':
    main()
