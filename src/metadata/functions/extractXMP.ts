/**
 * Funktionen zum Extrahieren von Metadaten aus Dateien
 */

import * as fs from 'fs';
import { parseMetadata } from './parseXMP';

/**
 * Extrahiert Metadaten aus einer Datei im RDF/XML-Format.
 * @param filePath - Der Pfad zur Datei.
 * @returns Ein Objekt mit den extrahierten Metadaten.
 * @throws Fehler, falls die Datei nicht lesbar oder ungültig ist.
 */
export function extractMetadata(filePath: string): Record<string, any> {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    return parseMetadata(fileContent);
  } catch (error) {
    throw new Error(`Failed to extract metadata from file: ${error.message}`);
  }
}

/**
 * Extrahiert spezifische Metadaten aus einer Datei.
 * @param filePath - Der Pfad zur Datei.
 * @param keys - Eine Liste von Metadaten-Schlüsseln, die extrahiert werden sollen.
 * @returns Ein Objekt mit den extrahierten spezifischen Metadaten.
 */
export function extractSpecificMetadataFromFile(
  filePath: string,
  keys: string[]
): Record<string, any> {
  const allMetadata = extractMetadata(filePath);
  return keys.reduce((result, key) => {
    if (allMetadata[key]) {
      result[key] = allMetadata[key];
    }
    return result;
  }, {} as Record<string, any>);
}
