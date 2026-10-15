import { describe, it, expect } from 'vitest';
import { calculateCRC32, formatCRC32 } from '../crc32';
import { rsEncodeBlock, rsDecodeBlock, encodeMessageStream, decodeMessageStream } from '../reedsolomon';

describe('CRC-32 Engine', () => {
  it('correctly calculates known IEEE 802.3 CRC-32 values', () => {
    // "123456789" is standard test vector: 0xCBF43926
    const testVector = new TextEncoder().encode("123456789");
    const crc = calculateCRC32(testVector);
    expect(formatCRC32(crc)).toBe("0xCBF43926");
  });

  it('detects single bit flips', () => {
    const data = new TextEncoder().encode("Air-Gapped SonicDrop Secret Key");
    const crcOriginal = calculateCRC32(data);
    const corrupted = new Uint8Array(data);
    corrupted[5] ^= 0x01; // flip 1 bit
    const crcCorrupted = calculateCRC32(corrupted);
    expect(crcCorrupted).not.toBe(crcOriginal);
  });
});

describe('Reed-Solomon GF(2^8) Codec', () => {
  it('encodes and decodes an uncorrupted block', () => {
    const msg = new TextEncoder().encode("SonicDrop AirGap");
    const eccBytes = 8;
    const encoded = rsEncodeBlock(msg, eccBytes);
    expect(encoded.length).toBe(msg.length + eccBytes);

    const decoded = rsDecodeBlock(encoded, eccBytes);
    expect(decoded.success).toBe(true);
    expect(decoded.errorsCorrected).toBe(0);
    expect(new TextDecoder().decode(decoded.data)).toBe("SonicDrop AirGap");
  });

  it('corrects up to t=4 corrupted symbols in a block with 8 ECC bytes', () => {
    const msg = new TextEncoder().encode("Professor Viva WOW Moment 2026!!");
    const eccBytes = 8;
    const encoded = rsEncodeBlock(msg, eccBytes);

    // Intentionally corrupt 4 distinct bytes in the block
    const corrupted = new Uint8Array(encoded);
    corrupted[2] ^= 0x55;
    corrupted[7] ^= 0xAA;
    corrupted[14] ^= 0xFF;
    corrupted[20] ^= 0x12;

    const decoded = rsDecodeBlock(corrupted, eccBytes);
    expect(decoded.success).toBe(true);
    expect(decoded.errorsCorrected).toBe(4);
    expect(new TextDecoder().decode(decoded.data)).toBe("Professor Viva WOW Moment 2026!!");
  });

  it('encodes and decodes multi-block message streams with error correction', () => {
    const secret = "ETH-PRIVATE-KEY: 0x4f3c98b67123aafe45129084bc34109867aefc1234567890abcdef1234567890";
    const payload = new TextEncoder().encode(secret);
    const encoded = encodeMessageStream(payload, 8, 24);

    // Corrupt random bytes across multiple blocks
    const corrupted = new Uint8Array(encoded);
    corrupted[3] ^= 0x44;
    corrupted[10] ^= 0x88;
    corrupted[35] ^= 0x99; // in second block
    corrupted[50] ^= 0x22; // in third block

    const decoded = decodeMessageStream(corrupted, payload.length, 8, 24);
    expect(decoded.success).toBe(true);
    expect(decoded.errorsCorrected).toBe(4);
    expect(new TextDecoder().decode(decoded.data)).toBe(secret);
  });
});
