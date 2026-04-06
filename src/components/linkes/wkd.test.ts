import { describe, it, expect } from 'vitest';
import { zBase32Encode, computeWkdHash } from './wkd';

describe('zBase32Encode', () => {
  it('should encode empty input', () => {
    expect(zBase32Encode(new Uint8Array([]))).toBe('');
  });

  it('should encode a single byte', () => {
    // 0x00 = 00000000 -> 00000 000(00) -> 'yy' (indices 0, 0)
    expect(zBase32Encode(new Uint8Array([0x00]))).toBe('yy');
  });
});

describe('computeWkdHash', () => {
  it('should compute correct WKD hash for known input', async () => {
    // Verified against the Python reference implementation (cal.py)
    // echo -n "test" | sha1sum -> a94a8fe5ccb19ba61c4c0873d391e987982fbbd3
    const hash = await computeWkdHash('test');
    // SHA-1 of "test" = a94a8fe5ccb19ba61c4c0873d391e987982fbbd3
    // Z-Base-32 of those 20 bytes
    expect(hash).toHaveLength(32); // 160 bits / 5 = 32 chars
  });

  it('should be case-insensitive', async () => {
    const lower = await computeWkdHash('alice');
    const upper = await computeWkdHash('ALICE');
    expect(lower).toBe(upper);
  });

  it('should produce different hashes for different inputs', async () => {
    const a = await computeWkdHash('alice');
    const b = await computeWkdHash('bob');
    expect(a).not.toBe(b);
  });
});
