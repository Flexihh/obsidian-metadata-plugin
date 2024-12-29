/**
 * API-Funktion zum Schreiben von Metadaten
 */

import { writeXMP } from '../functions/writeMetadata';
import { metadataCache } from '../functions/cacheMetadata';
import { isValidFileType, isValidMetadataType } from '../utils/validators';

/**
 * Schreibt Metadaten in eine Datei.
 * @param filePath - Pfad zur Datei.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff').
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title').
 * @param value - Wert der Metadaten.
 * @param useCache - Ob der Cache verwendet werden soll.
 * @throws Fehler, falls der Dateityp oder Metadatentyp ungültig ist.
 */
export async function write(
  filePath: string,
  fileType: string,
  metadataType: string,
  value: any,
  useCache = true
): Promise<void> {
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  if (!isValidMetadataType(metadataType)) {
    throw new Error(`Unsupported metadata type: ${metadataType}`);
  }

  const metadata = {
    original: { [metadataType]: value },
    standardized: { [metadataType]: value }
  };

  // Cache aktualisieren
  if (useCache) {
    metadataCache.set(filePath, {
      filePath,
      fileType: fileType as any,
      metadata,
      lastUpdated: new Date(),
    });
  }

  // Metadaten schreiben
  await writeXMP(filePath, metadata);
}
