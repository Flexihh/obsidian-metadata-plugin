import { XMP_MARKERS } from '../constants';

/**
 * Extrahiert XMP-Daten aus Binärdaten.
 * @param binaryData - Die Binärdaten der Datei.
 * @returns Ein XML-String mit den XMP-Daten oder null, falls keine gefunden wurden.
 */
export function extractMetadata(binaryData: Uint8Array): string | null {
  const binaryString = new TextDecoder().decode(binaryData);

  // Log des kompletten RAW-Inhalts
  // console.log("RAW Binary String:", binaryString);

  const xmpStart = binaryString.indexOf(XMP_MARKERS.START);
  const xmpEnd = binaryString.indexOf(XMP_MARKERS.END);

  if (xmpStart !== -1 && xmpEnd !== -1) {
    const xmpData = binaryString.substring(xmpStart, xmpEnd + XMP_MARKERS.END.length);

    // Log der extrahierten XMP-Daten
    console.log("Extracted XMP Metadata:", xmpData);

    return xmpData;
  }

  console.warn("No XMP metadata found in the provided binary data.");
  return null;
}
