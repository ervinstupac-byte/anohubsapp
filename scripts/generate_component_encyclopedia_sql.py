#!/usr/bin/env python3
"""
Generate SQL upsert statements from the CSV seed produced by extract_component_encyclopedia.py

Usage:
  python scripts/generate_component_encyclopedia_sql.py --in scripts/component_encyclopedia_seed.csv --out scripts/component_encyclopedia_seed.sql
"""
import argparse
import csv
import json
import html


def esc(s: str) -> str:
    if s is None:
        return ''
    return s.replace("'", "''")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--in', dest='input', required=True)
    parser.add_argument('--out', dest='output', required=True)
    args = parser.parse_args()

    rows = []
    with open(args.input, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)

    with open(args.output, 'w', encoding='utf-8') as out:
        out.write('-- Generated upsert SQL for component_encyclopedia\n')
        out.write('BEGIN;\n')
        for r in rows:
            cname = esc(r.get('component_name',''))
            desc = esc(r.get('description',''))
            physics = esc(r.get('physics_principle',''))
            common = r.get('common_failure_modes','') or '[]'
            # ensure common is valid JSON string literal
            try:
                json.loads(common)
                common_sql = f"'{esc(common)}'::jsonb"
            except Exception:
                # fallback: wrap as single-element array with the raw string
                common_sql = f"'{esc(json.dumps([common]))}'::jsonb"

            stmt = (
                "INSERT INTO public.component_encyclopedia (component_name, description, physics_principle, common_failure_modes) VALUES ('%s','%s','%s',%s) "
                "ON CONFLICT (component_name) DO UPDATE SET description = EXCLUDED.description, physics_principle = EXCLUDED.physics_principle, common_failure_modes = EXCLUDED.common_failure_modes, updated_at = now();\n"
            ) % (cname, desc, physics, common_sql)
            out.write(stmt)
        out.write('COMMIT;\n')

    print(f'Wrote {len(rows)} upsert statements to {args.output}')


if __name__ == '__main__':
    main()
