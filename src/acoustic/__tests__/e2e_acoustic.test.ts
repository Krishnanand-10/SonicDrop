import { describe, it, expect } from 'vitest';
import { buildPacket, parsePacket } from '../packet';

describe('End-to-End Packet Framing & Recovery', () => {
  it('correctly packs and reconstructs a cryptographic key payload', () => {
    const rawKey = "AES256: 0x9f4ae12dc5398204bbef3310492817346610beef";
    const payload = new TextEncoder().encode(rawKey);

    const packet = buildPacket(payload, 'crypto_key');
    expect(packet.length).toBeGreaterThan(payload.length);

    const decoded = parsePacket(packet);
    expect(decoded.kind).toBe('crypto_key');
    expect(decoded.crcValid).toBe(true);
    expect(decoded.text).toBe(rawKey);
  });

  it('reconstructs payload even with corrupted symbols via Reed-Solomon', () => {
    const message = "Air-Gapped Ultrasonic Transfer Viva Demo 2026!";
    const payload = new TextEncoder().encode(message);

    const packet = buildPacket(payload, 'text');

    // Corrupt 3 bytes in transmission within the payload block
    const corrupted = new Uint8Array(packet);
    corrupted[corrupted.length - 3] ^= 0x77;
    corrupted[corrupted.length - 8] ^= 0x33;
    corrupted[corrupted.length - 15] ^= 0x99;

    const decoded = parsePacket(corrupted);
    expect(decoded.crcValid).toBe(true);
    expect(decoded.errorsCorrected).toBeGreaterThan(0);
    expect(decoded.text).toBe(message);
  });

  it('correctly packs a binary file with filename metadata', () => {
    const fileBytes = new Uint8Array([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x01, 0x02, 0x03]);
    const filename = "secret-blueprint.png";

    const packet = buildPacket(fileBytes, 'file', { filename, mimeType: 'image/png' });

    const decoded = parsePacket(packet);
    expect(decoded.kind).toBe('file');
    expect(decoded.filename).toBe(filename);
    expect(decoded.mimeType).toBe('image/png');
    expect(decoded.crcValid).toBe(true);
    expect(decoded.data).toEqual(fileBytes);
  });
});
