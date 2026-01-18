// DossierLibrary: canonical loader (single-authoritative source)

import manifestRaw from '../../../scripts/hashes_applied.json';

export interface DossierFile {
  path: string;
  justification: string;
  category: 'Case Studies' | 'Technical Insights' | 'Maintenance Protocols' | 'Turbine Friend Dossiers';
  hash?: string;
}

function inferCategory(rel: string): DossierFile['category'] {
  const l = rel.toLowerCase();
  if (l.startsWith('case-studies/')) return 'Case Studies';
  if (l.startsWith('insights/')) return 'Technical Insights';
  if (l.startsWith('protocol/')) return 'Maintenance Protocols';
  if (l.startsWith('turbine_friend/') || l.startsWith('turbine-friend/')) return 'Turbine Friend Dossiers';
  return 'Maintenance Protocols';
}

function normalizeManifestPath(raw: string): string {
  // Preserve original casing; normalize separators and strip leading `public/` or `public/archive/`.
  const forward = raw.replace(/\\+/g, '/');
  const withoutPublic = forward.replace(/^public\//i, '');
  // If manifest included an initial 'archive/' segment, strip it. Use lowercase to match disk.
  return withoutPublic.replace(/^archive\//i, '').toLowerCase();
}

const manifest = (manifestRaw as Array<{ file: string; hash: string }>) || [];

export const DOSSIER_LIBRARY_RAW: DossierFile[] = manifest.map(entry => {
  const rel = normalizeManifestPath(entry.file);
  const category = inferCategory(rel);
  return {
    path: rel,
    justification: 'Canonical entry imported from scripts/hashes_applied.json (NC-10).',
    category,
    hash: entry.hash,
  } as DossierFile;
});

const normalizePath = (p: string) => p.replace(/\\/g, '/').replace(/protocol\/to_learn_archive\/protocols_v0\//g, 'protocol/');

const toArchiveAbsolute = (p: string) => {
  const cleaned = normalizePath(p).replace(/^\/+/, '');
  return `/archive/${cleaned}`;
};

export const DOSSIER_LIBRARY: DossierFile[] = DOSSIER_LIBRARY_RAW.map(d => ({ ...d, path: toArchiveAbsolute(d.path) }));

export const DOSSIER_LIBRARY_COUNT = DOSSIER_LIBRARY.length;
