import { extractMetadata } from '../functions/extractMetadata';
import { metadataCache } from '../functions/cacheMetadata';
import { isValidFileType } from '../utils/validators';
import { App } from 'obsidian';
import type {
  MetadataStandardKey,
  HybridMetadata,
  MetadataCacheEntry
} from '../types';

type MetadataReadType = 'all' | 'list' | 'subject' | 'original' | 'standardized' | MetadataStandardKey;
type MetadataResult = HybridMetadata | string[] | Partial<Record<MetadataStandardKey, unknown>>;

/**
 * Extrahiert Subject-Einträge aus dem Cache.
 */
function extractSubjectsFromCache(): string[] {
  const allSubjects = new Set<string>();

  metadataCache.getAllEntries().forEach((entry: MetadataCacheEntry) => {
    const subjects = entry.metadata?.standardized?.subject;
    if (subjects) {
      if (Array.isArray(subjects)) {
        subjects.forEach(subject => allSubjects.add(subject));
      } else {
        allSubjects.add(String(subjects));
      }
    }
  });

  return Array.from(allSubjects).sort();
}

/**
 * Verarbeitet einen Cache-Eintrag basierend auf dem Metadaten-Typ.
 */
function processCacheEntry(
  entry: MetadataCacheEntry,
  metadataType: MetadataReadType
): MetadataResult {
  switch (metadataType) {
    case 'all':
      return entry.metadata;
    case 'list':
      return Object.keys(entry.metadata) as MetadataStandardKey[];
    case 'subject': {
      const subjects = entry.metadata?.standardized?.subject;
      return Array.isArray(subjects) 
        ? [...new Set(subjects)].sort() 
        : [];
    }
    case 'original':
      return entry.metadata?.original ?? {};
    case 'standardized':
      return entry.metadata?.standardized ?? {};
    default:
      return {
        [metadataType]: entry.metadata[metadataType] ?? null
      };
  }
}

/**
 * Verarbeitet extrahierte Metadaten basierend auf dem Metadaten-Typ.
 */
function processExtractedMetadata(
  metadata: HybridMetadata,
  metadataType: MetadataReadType
): MetadataResult {
  switch (metadataType) {
    case 'all':
      return metadata;
    case 'list':
      return Object.keys(metadata.standardized) as MetadataStandardKey[];
    case 'subject': {
      const subjects = metadata.standardized?.subject;
      return Array.isArray(subjects) 
        ? [...new Set(subjects)].sort() 
        : [];
    }
    case 'original':
      return metadata.original;
    case 'standardized':
      return metadata.standardized;
    default:
      return {
        [metadataType]: metadata.standardized[metadataType] ?? null
      };
  }
}

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
  metadataType: MetadataReadType,
  app: App,
  filePath?: string,
  fileType?: string,
  useCache = true
): Promise<MetadataResult> {
  // Spezialfall: Alle `subject`-Einträge aus dem Cache (globaler Abruf)
  if (metadataType === 'subject' && !filePath && !fileType) {
    return extractSubjectsFromCache();
  }

  // Überprüfen, ob Dateipfad und -typ vorhanden sind
  if (!filePath || !fileType) {
    throw new Error('File path and type are required except for "subject" metadata type.');
  }

  // Prüfen, ob der Dateityp unterstützt wird
  if (!isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  // Metadaten aus dem Cache lesen, falls aktiviert
  if (useCache) {
    const cachedEntry = metadataCache.get(filePath);
    if (cachedEntry) {
      return processCacheEntry(cachedEntry, metadataType);
    }
  }

  // Metadaten direkt extrahieren, wenn nicht im Cache
  const metadata = await extractMetadata(filePath, app);
  return processExtractedMetadata(metadata, metadataType);
}
