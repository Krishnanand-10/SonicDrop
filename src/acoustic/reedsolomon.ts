/**
 * SonicDrop - Reed-Solomon Forward Error Correction (FEC)
 * Powered by ZXing GF(2^8) Reed-Solomon codec.
 * 
 * Capable of correcting burst audio errors caused by room multipath reflections,
 * ambient conversation, and background noise.
 */

import { RS_Encoder, RS_Decoder, GF_QR_CODE_256 } from 'reedsolomon.ts';

const field = GF_QR_CODE_256();
const encoder = new RS_Encoder(field);
const decoder = new RS_Decoder(field);

export interface RSDecodeResult {
  data: Uint8Array;
  errorsCorrected: number;
  success: boolean;
}

/**
 * Encodes a block of data by appending numEccBytes of parity.
 * @param msg Data bytes of length K
 * @param numEccBytes Parity count (2t)
 * @returns Encoded block of length K + numEccBytes
 */
export function rsEncodeBlock(msg: Uint8Array, numEccBytes: number): Uint8Array {
  const buf = new Int32Array(msg.length + numEccBytes);
  for (let i = 0; i < msg.length; i++) {
    buf[i] = msg[i];
  }
  encoder.encode(buf, numEccBytes);

  const out = new Uint8Array(buf.length);
  for (let i = 0; i < buf.length; i++) {
    out[i] = buf[i] & 0xFF;
  }
  return out;
}

/**
 * Decodes a block, correcting up to floor(numEccBytes / 2) errors in-place.
 */
export function rsDecodeBlock(received: Uint8Array, numEccBytes: number): RSDecodeResult {
  const buf = new Int32Array(received.length);
  for (let i = 0; i < received.length; i++) {
    buf[i] = received[i];
  }

  try {
    decoder.decode(buf, numEccBytes);
    const k = received.length - numEccBytes;
    const out = new Uint8Array(k);
    let diffCount = 0;
    for (let i = 0; i < k; i++) {
      out[i] = buf[i] & 0xFF;
      if (out[i] !== received[i]) {
        diffCount++;
      }
    }
    return {
      data: out,
      errorsCorrected: diffCount,
      success: true,
    };
  } catch {
    // Decoding failed (errors exceed error correction capacity)
    const k = received.length - numEccBytes;
    return {
      data: received.slice(0, Math.max(0, k)),
      errorsCorrected: 0,
      success: false,
    };
  }
}

/**
 * Splits a full message into blocks of size K, applies Reed-Solomon parity (numEccBytes),
 * and returns the full encoded message stream.
 */
export function encodeMessageStream(payload: Uint8Array, eccBytesPerBlock = 8, blockSizeK = 24): Uint8Array {
  const numBlocks = Math.ceil(payload.length / blockSizeK);
  const blockSizeN = blockSizeK + eccBytesPerBlock;
  const out = new Uint8Array(numBlocks * blockSizeN);

  for (let b = 0; b < numBlocks; b++) {
    const chunk = new Uint8Array(blockSizeK);
    const start = b * blockSizeK;
    const end = Math.min(start + blockSizeK, payload.length);
    chunk.set(payload.subarray(start, end), 0);

    const encoded = rsEncodeBlock(chunk, eccBytesPerBlock);
    out.set(encoded, b * blockSizeN);
  }

  return out;
}

/**
 * Decodes an encoded message stream block by block, correcting symbol errors.
 */
export function decodeMessageStream(
  stream: Uint8Array,
  originalPayloadLength: number,
  eccBytesPerBlock = 8,
  blockSizeK = 24
): RSDecodeResult {
  const blockSizeN = blockSizeK + eccBytesPerBlock;
  const numBlocks = Math.floor(stream.length / blockSizeN);
  const out = new Uint8Array(numBlocks * blockSizeK);
  let totalErrors = 0;
  let allSuccess = true;

  for (let b = 0; b < numBlocks; b++) {
    const block = stream.subarray(b * blockSizeN, (b + 1) * blockSizeN);
    const res = rsDecodeBlock(block, eccBytesPerBlock);
    if (!res.success) {
      allSuccess = false;
    }
    totalErrors += res.errorsCorrected;
    out.set(res.data, b * blockSizeK);
  }

  return {
    data: out.slice(0, originalPayloadLength),
    errorsCorrected: totalErrors,
    success: allSuccess,
  };
}
