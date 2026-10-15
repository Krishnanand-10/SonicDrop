import { describe, it, expect } from 'vitest';
import { buildPacket, parsePacket } from '../packet';

describe('Packet Framing & Integrity', () => {
  it('builds and parses text payload with CRC32 match', () => {
    const text = 'Air-gapped verification key: 0x9f4ae12d';
    const payload = new TextEncoder().encode(text);
    const packet = buildPacket(payload, 'crypto_key');

    const result = parsePacket(packet);
    expect(result.kind).toBe('crypto_key');
    expect(result.text).toBe(text);
    expect(result.crcValid).toBe(true);
    expect(result.errorsCorrected).toBe(0);
  });

  it('builds and parses file payload with filename metadata', () => {
    const fileBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01, 0x02, 0x03]);
    const packet = buildPacket(fileBytes, 'file', {
      filename: 'secret_qr.png',
      mimeType: 'image/png'
    });

    const result = parsePacket(packet);
    expect(result.kind).toBe('file');
    expect(result.filename).toBe('secret_qr.png');
    expect(result.mimeType).toBe('image/png');
    expect(result.crcValid).toBe(true);
    expect(result.data).toEqual(fileBytes);
  });

  it('recovers corrupted payload bytes inside framed packet via Reed-Solomon', () => {
    const text = 'Secret message transmitted over inaudible sound waves!';
    const payload = new TextEncoder().encode(text);
    const packet = buildPacket(payload, 'text');

    // Corrupt 3 bytes in the payload section of the packet
    const corrupted = new Uint8Array(packet);
    corrupted[corrupted.length - 5] ^= 0x33;
    corrupted[corrupted.length - 12] ^= 0x77;
    corrupted[corrupted.length - 20] ^= 0xAA;

    const result = parsePacket(corrupted);
    expect(result.crcValid).toBe(true);
    expect(result.text).toBe(text);
    expect(result.errorsCorrected).toBeGreaterThan(0);
  });
});
