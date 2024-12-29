/**
 * API-Funktion zum Löschen von Metadaten
 */

import { writeXMP } from '../functions/writeMetadata';
import { metadataCache } from '../functions/cacheMetadata';
import { isValidFileType, isValidMetadataType } from '../utils/validators';
import { MetadataType } from '../types';

/**
 * Entfernt spezifische oder alle Werte eines Metadaten-Typs aus einer Datei.
 * @param filePath - Pfad zur Datei.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff').
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title', 'all').
 * @param value - Optionaler Wert, der gelöscht werden soll (nur für spezifische Einträge).
 * @param useCache - Ob der Cache verwendet werden soll.
 * @throws Fehler, falls der Dateityp oder Metadatentyp ungültig ist.
 */
export async function deleteMetadata(
  filePath: string,
  fileType: string,
  metadataType: MetadataType | 'all',
  value?: any,
  useCache = true
): Promise<void> {
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  if (metadataType !== 'all' && !isValidMetadataType(metadataType)) {
    throw new Error(`Unsupported metadata type: ${metadataType}`);
  }

  // Cache-Daten holen und sicher initialisieren
  const cachedMetadata = useCache ? metadataCache.get(filePath)?.metadata : {};
  let updatedMetadata: Record<MetadataType, any> = {
    author: null,
    title: null,
    keywords: null,
    description: null,
    date: null,
    gps: null,
    custom: null,
    ...cachedMetadata, // Überschreibt mit Cache-Werten
  };

  // Entfernen der Metadaten
  if (metadataType === 'all') {
    // Alle Metadaten zurücksetzen
    updatedMetadata = {
      author: null,
      title: null,
      keywords: null,
      description: null,
      date: null,
      gps: null,
      custom: null,
    };
  } else {
    if (value !== undefined) {
      // Entferne nur den spezifischen Wert
      if (Array.isArray(updatedMetadata[metadataType])) {
        updatedMetadata[metadataType] = updatedMetadata[metadataType].filter(
          (item: any) => item !== value
        );
      } else if (updatedMetadata[metadataType] === value) {
        updatedMetadata[metadataType] = null;
      }
    } else {
      // Entferne den gesamten Typ
      updatedMetadata[metadataType] = null;
    }
  }

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
