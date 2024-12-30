import { METADATA_KEY_MAPPING } from '../constants';
import type { MetadataOriginalKey, MetadataStandardKey } from '../types';

/**
 * Standardisiert Metadaten für eine konsistente Struktur.
 * @param rawMetadata - Die rohen Metadaten.
 * @returns Die standardisierten Metadaten.
 */
export function standardizeMetadata(
  rawMetadata: Partial<Record<MetadataOriginalKey, unknown>>
): Partial<Record<MetadataStandardKey, unknown>> {
  const standardizedMetadata: Partial<Record<MetadataStandardKey, unknown>> = {};

  console.log('Standardisierung gestartet. Eingehende Metadaten:', rawMetadata);

  for (const [originalKey, standardizedKey] of Object.entries(METADATA_KEY_MAPPING)) {
    const typedStandardKey = standardizedKey as MetadataStandardKey;

    // Groß-/Kleinschreibung unabhängige Suche
    const matchedKey = Object.keys(rawMetadata).find(
      (key) => key.toLowerCase() === originalKey.toLowerCase()
    );

    if (matchedKey && rawMetadata[matchedKey] !== undefined) {
      standardizedMetadata[typedStandardKey] = rawMetadata[matchedKey];
      console.log(
        `Schlüssel gefunden: '${matchedKey}' -> '${standardizedKey}'. Wert:`,
        rawMetadata[matchedKey]
      );
    } else {
      console.log(`Schlüssel nicht gefunden: '${originalKey}'`);
    }
  }

  console.log('Standardisierung abgeschlossen. Standardisierte Metadaten:', standardizedMetadata);

  return standardizedMetadata;
}
