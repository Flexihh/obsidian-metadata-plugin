import { XMP_MARKERS } from '../constants';

/**
 * Extrahiert XMP-Daten aus Binärdaten.
 * @param binaryData - Die Binärdaten der Datei.
 * @returns Ein XML-String mit den XMP-Daten oder null, falls keine gefunden wurden.
 */
export function extractMetadata(binaryData: Uint8Array): string | null {
  const binaryString = new TextDecoder().decode(binaryData);

  const xmpStart = binaryString.indexOf(XMP_MARKERS.START);
  const xmpEnd = binaryString.indexOf(XMP_MARKERS.END);

  if (xmpStart !== -1 && xmpEnd !== -1) {
    return binaryString.substring(xmpStart, xmpEnd + XMP_MARKERS.END.length);
  }

  return null;
}
