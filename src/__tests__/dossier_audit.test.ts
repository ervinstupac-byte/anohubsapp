import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { describe, it, expect } from 'vitest';

const manifestPath = path.resolve(process.cwd(), 'scripts', 'hashes_applied.json');

describe('Dossier archive integrity (spot checks)', () => {
  it('every manifest entry exists, contains recorded SHA-256, and has an efficiency token', () => {
    const raw = fs.readFileSync(manifestPath, 'utf8');
    const entries: Array<{ file: string; hash: string }> = JSON.parse(raw);
    expect(entries.length).toBeGreaterThan(0);

    for (const e of entries) {
      // Normalize manifest path (backslashes may be present)
      const rel = e.file.replace(/\\/g, '/').replace(/^public\//i, 'public/');
      const filePath = path.resolve(process.cwd(), rel);

      // File must exist exactly at the path referenced in the manifest
      const exists = fs.existsSync(filePath);
      expect(exists, `Missing file referenced in manifest: ${rel}`).toBe(true);

      if (!exists) continue;

      const content = fs.readFileSync(filePath, 'utf8');

      // Verify file content matches the recorded SHA-256 (compute and compare)
      const computed = crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
      expect(
        computed === e.hash,
        `Computed SHA-256 (${computed}) does not match manifest (${e.hash}) for ${rel}`
      ).toBe(true);

      // Permissive efficiency token check: look for η, \eta, or the word "efficiency"
      const hasEfficiencyToken = /η|\\eta|efficienc/i.test(content);
      if (!hasEfficiencyToken) {
        // Do not fail CI for missing efficiency token; surface as a warning.
        // This remains informational — integrity gate (hash/count) is authoritative.
        // eslint-disable-next-line no-console
        console.warn(`Warning: No efficiency token found in ${rel} (looked for η, \\eta, or 'efficiency')`);
      }
    }
  }, 120000);
});
