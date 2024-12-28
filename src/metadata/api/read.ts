/**
 * API-Funktion zum Lesen von Metadaten
 */

import { extractMetadata } from '../functions/extractXMP';
import { metadataCache } from '../cache/metadataCache';
import { isValidFileType } from '../utils/validators';

/**
 * Liest spezifische Metadaten oder alle Metadaten aus einer Datei.
 * @param filePath - Pfad zur Datei.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff').
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title', 'all').
 * @param useCache - Ob der Cache verwendet werden soll.
 * @returns Die Metadaten als Schlüssel-Wert-Paare oder eine Liste von verfügbaren Metadaten-Typen.
 * @throws Fehler, falls der Dateityp ungültig ist.
 */
export async function read(
  filePath: string,
  fileType: string,
  metadataType: 'all' | 'list' | string,
  useCache = true
): Promise<Record<string, any> | string[]> {
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  if (useCache) {
    const cachedEntry = metadataCache.get(filePath);
    if (cachedEntry) {
      if (metadataType === 'all') {
        return cachedEntry.metadata;
      }
      if (metadataType === 'list') {
        return Object.keys(cachedEntry.metadata);
      }
      return { [metadataType]: cachedEntry.metadata[metadataType] };
    }
  }

  const metadata = extractMetadata(filePath);

  if (metadataType === 'all') {
    return metadata;
  }
  if (metadataType === 'list') {
    return Object.keys(metadata);
  }
  return { [metadataType]: metadata[metadataType] };
}
