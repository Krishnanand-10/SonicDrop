/**
 * SonicDrop - IEEE 802.3 CRC-32 Engine
 * Precomputed 256-entry lookup table for high-speed bit integrity validation.
 */

const CRC32_POLYNOMIAL = 0xEDB88320;
const CRC32_TABLE = new Uint32Array(256);

// Precompute CRC-32 lookup table
(() => {
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (CRC32_POLYNOMIAL ^ (c >>> 1)) : (c >>> 1);
    }
    CRC32_TABLE[i] = c >>> 0;
  }
})();

/**
 * Calculates the standard IEEE 802.3 CRC-32 checksum of a byte buffer.
 * @param buffer Uint8Array of bytes
 * @returns 32-bit unsigned integer checksum
 */
export function calculateCRC32(buffer: Uint8Array): number {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buffer.length; i++) {
    const tableIndex = (crc ^ buffer[i]) & 0xFF;
    crc = (crc >>> 8) ^ CRC32_TABLE[tableIndex];
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

/**
 * Formats a 32-bit CRC into an 8-character uppercase hex string (e.g. "0x9F4AE12D").
 */
export function formatCRC32(crc: number): string {
  return '0x' + (crc >>> 0).toString(16).toUpperCase().padStart(8, '0');
}
