import { describe, it, expect } from 'vitest';
import { getGGWaveEngine } from '../ggwave-engine';

describe('WebAssembly ggwave Acoustic Engine', () => {
  it('initializes WASM engine and encodes ultrasonic & audible payloads', async () => {
    const { ggwave, txInstanceId, rxInstanceId } = await getGGWaveEngine(48000);
    expect(txInstanceId).toBeGreaterThanOrEqual(0);
    expect(rxInstanceId).toBeGreaterThanOrEqual(0);

    // Test ultrasonic encoding
    const testText = 'SonicDrop-AirGap-Test-0x9F4AE12D';
    const rawUltrasound = ggwave.encode(
      txInstanceId,
      testText,
      ggwave.ProtocolId.GGWAVE_PROTOCOL_ULTRASOUND_NORMAL,
      50
    );
    expect(rawUltrasound).toBeDefined();
    expect(rawUltrasound.length).toBeGreaterThan(0);

    // Test audible encoding
    const rawAudible = ggwave.encode(
      txInstanceId,
      testText,
      ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_NORMAL,
      50
    );
    expect(rawAudible).toBeDefined();
    expect(rawAudible.length).toBeGreaterThan(0);
  });

  it('demodulates audio stream and recovers exact text payload', async () => {
    const { ggwave, txInstanceId, rxInstanceId } = await getGGWaveEngine(48000);
    const secretMsg = 'KEY:0x39a1f4b2';

    const encoded = ggwave.encode(
      txInstanceId,
      secretMsg,
      ggwave.ProtocolId.GGWAVE_PROTOCOL_AUDIBLE_NORMAL,
      50
    );

    let decodedResult: string | null = null;
    const chunkSize = 1024 * 4;

    // Feed chunks into receiver
    for (let i = 0; i < encoded.length; i += chunkSize) {
      const chunk = encoded.slice(i, Math.min(i + chunkSize, encoded.length));
      const res = ggwave.decode(rxInstanceId, chunk);
      if (res && res.length > 0) {
        decodedResult = new TextDecoder('utf-8').decode(new Uint8Array(res.buffer, res.byteOffset, res.byteLength));
      }
    }

    // Trailing silence chunks
    const silence = new Int8Array(chunkSize);
    for (let i = 0; i < 15 && !decodedResult; i++) {
      const res = ggwave.decode(rxInstanceId, silence);
      if (res && res.length > 0) {
        decodedResult = new TextDecoder('utf-8').decode(new Uint8Array(res.buffer, res.byteOffset, res.byteLength));
      }
    }

    expect(decodedResult).toBe(secretMsg);
  });
});
