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
    const typedOriginalKey = originalKey as MetadataOriginalKey;
    const typedStandardKey = standardizedKey as MetadataStandardKey;

    if (rawMetadata[typedOriginalKey] !== undefined) {
      standardizedMetadata[typedStandardKey] = rawMetadata[typedOriginalKey];
      console.log(
        `Schlüssel gefunden: '${originalKey}' -> '${standardizedKey}'. Wert:`,
        rawMetadata[typedOriginalKey]
      );
    } else {
      console.log(`Schlüssel nicht gefunden: '${originalKey}'`);
    }
  }

  console.log('Standardisierung abgeschlossen. Standardisierte Metadaten:', standardizedMetadata);

  return standardizedMetadata;
}
