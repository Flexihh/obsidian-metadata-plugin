/**
 * API-Funktion zum Aktualisieren von Metadaten
 */

import { writeXMP } from '../functions/writeXMP';
import { metadataCache } from '../cache/metadataCache';
import { isValidFileType, isValidMetadataType } from '../utils/validators';
import { MetadataType } from '../types';

/**
 * Aktualisiert Metadaten in einer Datei.
 * @param filePath - Pfad zur Datei.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff').
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title').
 * @param newValue - Neuer Wert der Metadaten.
 * @param useCache - Ob der Cache verwendet werden soll.
 * @throws Fehler, falls der Dateityp oder Metadatentyp ungültig ist.
 */
export async function update(
  filePath: string,
  fileType: string,
  metadataType: MetadataType,
  newValue: any,
  useCache = true
): Promise<void> {
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  if (!isValidMetadataType(metadataType)) {
    throw new Error(`Unsupported metadata type: ${metadataType}`);
  }

  // Cache-Daten holen und sicher initialisieren
  const cachedMetadata = useCache ? metadataCache.get(filePath)?.metadata : {};
  const updatedMetadata: Record<MetadataType, any> = {
    author: cachedMetadata?.author || null,
    title: cachedMetadata?.title || null,
    keywords: cachedMetadata?.keywords || null,
    description: cachedMetadata?.description || null,
    date: cachedMetadata?.date || null,
    gps: cachedMetadata?.gps || null,
    custom: cachedMetadata?.custom || null,
    [metadataType]: newValue, // Aktualisiertes Feld
  };

  // Cache aktualisieren
  if (useCache) {
    metadataCache.set(filePath, {
      filePath,
      fileType: fileType as any,
      metadata: updatedMetadata,
      lastUpdated: new Date(),
    });
  }

  // Aktualisierte Metadaten schreiben
  await writeXMP(filePath, updatedMetadata);
}
