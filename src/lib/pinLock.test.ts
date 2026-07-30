import { describe, it, expect } from 'vitest';
import { generateSalt, hashPin } from './pinLock';

describe('generateSalt', () => {
  it('returns a 32-character hex string', () => {
    const salt = generateSalt();
    expect(salt).toMatch(/^[0-9a-f]{32}$/);
  });

  it('returns a different value on each call', () => {
    expect(generateSalt()).not.toBe(generateSalt());
  });
});

describe('hashPin', () => {
  it('is deterministic for the same PIN and salt', async () => {
    const salt = generateSalt();
    const hash1 = await hashPin('1234', salt);
    const hash2 = await hashPin('1234', salt);
    expect(hash1).toBe(hash2);
  });

  it('produces a different hash for a different PIN with the same salt', async () => {
    const salt = generateSalt();
    const hash1 = await hashPin('1234', salt);
    const hash2 = await hashPin('4321', salt);
    expect(hash1).not.toBe(hash2);
  });

  it('produces a different hash for the same PIN with a different salt', async () => {
    const hash1 = await hashPin('1234', 'salt-a');
    const hash2 = await hashPin('1234', 'salt-b');
    expect(hash1).not.toBe(hash2);
  });

  it('never stores the PIN itself in the hash output', async () => {
    const hash = await hashPin('1234', generateSalt());
    expect(hash).not.toContain('1234');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
  });
});
