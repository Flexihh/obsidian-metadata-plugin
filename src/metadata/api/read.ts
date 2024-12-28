import { extractMetadata } from '../functions/extractXMP';
import { metadataCache } from '../cache/metadataCache';
import { isValidFileType } from '../utils/validators';
import { App } from 'obsidian';

/**
 * Liest spezifische Metadaten oder alle Metadaten aus einer Datei.
 * @param filePath - Pfad zur Datei.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff').
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title', 'all').
 * @param app - Die Obsidian-App-Instanz.
 * @param useCache - Ob der Cache verwendet werden soll.
 * @returns Die Metadaten als Schlüssel-Wert-Paare oder eine Liste von verfügbaren Metadaten-Typen.
 * @throws Fehler, falls der Dateityp ungültig ist oder keine Daten verfügbar sind.
 */
export async function read(
  filePath: string,
  fileType: string,
  metadataType: 'all' | 'list' | string,
  app: App,
  useCache = true
): Promise<Record<string, any> | string[]> {
  // Überprüfen, ob der Dateityp unterstützt wird
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  // Wenn der Cache verwendet werden soll
  if (useCache) {
    const cachedEntry = metadataCache.get(filePath);

    if (cachedEntry) {
      // Metadaten aus dem Cache zurückgeben
      if (metadataType === 'all') {
        return cachedEntry.metadata;
      }
      if (metadataType === 'list') {
        return Object.keys(cachedEntry.metadata);
      }

      // Standardwert bereitstellen, wenn der Metadatentyp fehlt
      return {
        [metadataType]: cachedEntry.metadata[metadataType] || null,
      };
    }
  }

  // Wenn der Cache nicht verwendet wird oder keine Daten im Cache gefunden wurden
  const metadata = await extractMetadata(filePath, app);

  // Alle Metadaten zurückgeben
  if (metadataType === 'all') {
    return metadata;
  }

  // Liste der verfügbaren Metadaten zurückgeben
  if (metadataType === 'list') {
    return Object.keys(metadata);
  }

  // Einzelne Metadaten oder Standardwert zurückgeben
  return {
    [metadataType]: metadata[metadataType] || null,
  };
}
