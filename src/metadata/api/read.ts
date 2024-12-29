import { extractMetadata } from '../functions/extractXMP';
import { metadataCache } from '../cache/metadataCache';
import { isValidFileType } from '../utils/validators';
import { App } from 'obsidian';

/**
 * Liest spezifische Metadaten oder alle Metadaten aus einer Datei.
 * Unterstützt auch globale Anfragen nach bestimmten Typen (z. B. alle `subject`-Einträge).
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title', 'all', 'subject').
 * @param app - Die Obsidian-App-Instanz.
 * @param filePath - Pfad zur Datei (optional für globale Anfragen).
 * @param fileType - Typ der Datei (optional für globale Anfragen).
 * @param useCache - Ob der Cache verwendet werden soll.
 * @returns Die Metadaten als Schlüssel-Wert-Paare, eine Liste von verfügbaren Metadaten-Typen oder alle `subject`-Einträge.
 * @throws Fehler, falls der Dateityp ungültig ist oder keine Daten verfügbar sind.
 */
export async function read(
  metadataType: 'all' | 'list' | 'subject' | string,
  app: App,
  filePath?: string,
  fileType?: string,
  useCache = true
): Promise<Record<string, any> | string[]> {
  // Spezialfall: Alle `subject`-Einträge aus dem Cache (globaler Abruf)
  if (metadataType === 'subject' && !filePath && !fileType) {
    const allSubjects: string[] = [];

    metadataCache.getAllEntries().forEach((entry) => {
      const subjects = entry.metadata?.standardized?.subject;

      if (subjects) {
        if (Array.isArray(subjects)) {
          allSubjects.push(...subjects);
        } else {
          allSubjects.push(subjects);
        }
      }
    });

    return [...new Set(allSubjects)].sort(); // Deduplizieren und sortieren
  }

  // Überprüfen, ob Dateipfad und -typ vorhanden sind
  if (!filePath || !fileType) {
    throw new Error(`File path and type are required except for 'subject' metadata type.`);
  }

  // Prüfen, ob der Dateityp unterstützt wird
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  // Metadaten aus dem Cache lesen, falls aktiviert
  if (useCache) {
    const cachedEntry = metadataCache.get(filePath);

    if (cachedEntry) {
      if (metadataType === 'all') {
        return cachedEntry.metadata; // Alle Metadaten zurückgeben
      }
      if (metadataType === 'list') {
        return Object.keys(cachedEntry.metadata); // Liste der Metadaten-Typen
      }
      if (metadataType === 'subject') {
        const subjects = cachedEntry.metadata?.standardized?.subject;
        return Array.isArray(subjects) ? [...new Set(subjects)].sort() : []; // Sortiert und dedupliziert
      }

      // Spezifische Metadaten abrufen
      return {
        [metadataType]: cachedEntry.metadata[metadataType] || null,
      };
    }
  }

  // Metadaten direkt extrahieren, wenn nicht im Cache
  const metadata = await extractMetadata(filePath, app);

  if (metadataType === 'all') {
    return metadata; // Alle Metadaten zurückgeben
  }
  if (metadataType === 'list') {
    return Object.keys(metadata); // Liste der Metadaten-Typen
  }
  if (metadataType === 'subject') {
    const subjects = metadata?.standardized?.subject;
    return Array.isArray(subjects) ? [...new Set(subjects)].sort() : []; // Sortiert und dedupliziert
  }

  // Rückgabe für spezifische Metadaten
  return {
    [metadataType]: metadata[metadataType] || null,
  };
}
