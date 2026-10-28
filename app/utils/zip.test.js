import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { crc32, zip } from './zip';

describe('zip', () => {
  it('computes CRC-32 as ZIP checks it', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('makes an archive that unzip reads back', () => {
    const archive = zip({ 'games.csv': 'id,name\n1,Héros\n', 'README.txt': 'ODbL' });
    const dir = mkdtempSync(join(tmpdir(), 'zip-test-'));
    const file = join(dir, 'test.zip');
    writeFileSync(file, archive);
    let listing;
    try {
      listing = execFileSync('unzip', ['-t', file], { encoding: 'utf8' });
    } catch (error) {
      if (error.code === 'ENOENT') return; // No unzip here: the CRC test still checks the core.
      throw error;
    }
    expect(listing).toContain('No errors detected');
    expect(execFileSync('unzip', ['-p', file, 'games.csv'], { encoding: 'utf8' })).toBe('id,name\n1,Héros\n');
  });
});
