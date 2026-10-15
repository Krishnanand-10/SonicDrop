/**
 * SonicDrop - Packet Framing & Framing Protocol
 * 
 * Frame Format:
 * [MAGIC_BYTE (1B: 0x53 'S')]
 * [KIND (1B: 0x01 text, 0x02 crypto_key, 0x03 file)]
 * [PAYLOAD_LEN_HI (1B)]
 * [PAYLOAD_LEN_LO (1B)]
 * [CRC32 (4B big-endian)]
 * [HEADER_XOR_CHECKSUM (1B)]
 * [METADATA_LEN (1B)]
 * [METADATA_BYTES (N bytes: JSON containing { filename, mimeType })]
 * [ENCODED_PAYLOAD_WITH_RS_PARITY (M bytes)]
 */

import { calculateCRC32 } from './crc32';
import { encodeMessageStream, decodeMessageStream, type RSDecodeResult } from './reedsolomon';
import { PAYLOAD_KIND_MAP, REVERSE_PAYLOAD_KIND_MAP, type PayloadKind, type DecodedPayload } from './types';

export const MAGIC_BYTE = 0x53; // ASCII 'S'

export interface PacketMetadata {
  filename?: string;
  mimeType?: string;
}

/**
 * Packs raw payload into a framed byte stream with RS error correction and CRC-32.
 */
export function buildPacket(
  payload: Uint8Array,
  kind: PayloadKind,
  metadata?: PacketMetadata,
  eccBytes = 8,
  blockK = 24
): Uint8Array {
  const crc = calculateCRC32(payload);
  const kindByte = PAYLOAD_KIND_MAP[kind];
  const len = payload.length;

  const metaJson = metadata ? JSON.stringify(metadata) : '';
  const metaBytes = new TextEncoder().encode(metaJson);

  // 1. Build Header: 10 bytes + metaBytes.length
  // [MAGIC, KIND, LEN_HI, LEN_LO, CRC0, CRC1, CRC2, CRC3, HEADER_XOR, META_LEN, ...META]
  const header = new Uint8Array(10 + metaBytes.length);
  header[0] = MAGIC_BYTE;
  header[1] = kindByte;
  header[2] = (len >> 8) & 0xFF;
  header[3] = len & 0xFF;

  // CRC-32 in big endian
  header[4] = (crc >>> 24) & 0xFF;
  header[5] = (crc >>> 16) & 0xFF;
  header[6] = (crc >>> 8) & 0xFF;
  header[7] = crc & 0xFF;

  // Header XOR checksum over first 8 bytes
  let xor = 0;
  for (let i = 0; i < 8; i++) {
    xor ^= header[i];
  }
  header[8] = xor;
  header[9] = metaBytes.length & 0xFF;
  if (metaBytes.length > 0) {
    header.set(metaBytes, 10);
  }

  // 2. Encode Header with 4 bytes RS parity for header protection
  const protectedHeader = encodeMessageStream(header, 4, header.length);

  // 3. Encode Payload with RS parity
  const protectedPayload = encodeMessageStream(payload, eccBytes, blockK);

  // 4. Combine Header length marker + protectedHeader + protectedPayload
  const fullPacket = new Uint8Array(2 + protectedHeader.length + protectedPayload.length);
  fullPacket[0] = (protectedHeader.length >> 8) & 0xFF;
  fullPacket[1] = protectedHeader.length & 0xFF;
  fullPacket.set(protectedHeader, 2);
  fullPacket.set(protectedPayload, 2 + protectedHeader.length);

  return fullPacket;
}

/**
 * Parses and verifies a received packet frame.
 */
export function parsePacket(
  packetBytes: Uint8Array,
  eccBytes = 8,
  blockK = 24
): DecodedPayload {
  if (packetBytes.length < 14) {
    throw new Error('Packet too short');
  }

  const protectedHeaderLen = (packetBytes[0] << 8) | packetBytes[1];
  if (packetBytes.length < 2 + protectedHeaderLen) {
    throw new Error('Incomplete header block');
  }

  const protectedHeader = packetBytes.subarray(2, 2 + protectedHeaderLen);
  const headerDecoded = decodeMessageStream(protectedHeader, protectedHeaderLen - 4, 4, protectedHeaderLen - 4);
  const header = headerDecoded.data;

  if (header[0] !== MAGIC_BYTE) {
    throw new Error(`Invalid Magic Byte: expected 0x53, received 0x${header[0]?.toString(16)}`);
  }

  // Verify header XOR checksum
  let xor = 0;
  for (let i = 0; i < 8; i++) {
    xor ^= header[i];
  }
  if (header[8] !== xor) {
    throw new Error('Header checksum mismatch');
  }

  const kind = REVERSE_PAYLOAD_KIND_MAP[header[1]] || 'text';
  const payloadLen = (header[2] << 8) | header[3];
  const expectedCrc = ((header[4] << 24) | (header[5] << 16) | (header[6] << 8) | header[7]) >>> 0;

  const metaLen = header[9];
  let meta: PacketMetadata = {};
  if (metaLen > 0 && header.length >= 10 + metaLen) {
    try {
      const metaStr = new TextDecoder().decode(header.subarray(10, 10 + metaLen));
      meta = JSON.parse(metaStr);
    } catch {
      // Ignore meta parse error
    }
  }

  const protectedPayload = packetBytes.subarray(2 + protectedHeaderLen);
  const payloadDecoded: RSDecodeResult = decodeMessageStream(protectedPayload, payloadLen, eccBytes, blockK);
  const actualCrc = calculateCRC32(payloadDecoded.data);

  const crcValid = actualCrc === expectedCrc;
  const totalErrors = headerDecoded.errorsCorrected + payloadDecoded.errorsCorrected;

  let text: string | undefined;
  if (kind === 'text' || kind === 'crypto_key') {
    text = new TextDecoder().decode(payloadDecoded.data);
  }

  return {
    kind,
    filename: meta.filename,
    mimeType: meta.mimeType,
    data: payloadDecoded.data,
    text,
    crc32: actualCrc,
    crcValid,
    errorsCorrected: totalErrors,
    receivedAt: new Date(),
    transmissionDurationMs: 0,
  };
}
