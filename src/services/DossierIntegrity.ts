// Lightweight integrity summary derived from the DOSSIER_LIBRARY (hash manifest)
import { DossierFile } from '../data/knowledge/DossierLibrary';

export interface IntegritySummary {
  totalFiles: number;
  uniqueHashes: number;
  healthPercent: number; // 0-100
  mtbfEstimateHours: number; // arbitrary estimate derived from manifest diversity
  riskScore: number; // 0-100 (higher = more risk)
}

export function computeIntegritySummary(library: DossierFile[]): IntegritySummary {
  const totalFiles = library.length;
  const hashes = library.map(e => e.hash || '');
  const uniqueHashes = new Set(hashes).size;

  // Duplicate ratio: fraction of files sharing hashes (lower is better)
  const duplicateRatio = totalFiles > 0 ? (totalFiles - uniqueHashes) / totalFiles : 0;

  // Health heuristic: penalize duplicates moderately
  const healthPercent = Math.max(50, Math.round((1 - duplicateRatio) * 100));

  // MTBF estimate: more unique hashes implies richer provenance -> higher MTBF
  const mtbfEstimateHours = Math.max(1000, Math.round((uniqueHashes / Math.max(1, totalFiles)) * 20000));

  // Risk: proportional to duplicateRatio
  const riskScore = Math.min(100, Math.round(duplicateRatio * 100));

  return {
    totalFiles,
    uniqueHashes,
    healthPercent,
    mtbfEstimateHours,
    riskScore,
  };
}
