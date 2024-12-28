/**
 * Funktionen zum Extrahieren von Metadaten aus Dateien.
 */

import { parseMetadata } from './parseXMP';
import { App, TFile } from 'obsidian';

/**
 * Extrahiert Metadaten aus einer Datei mit XMP-Daten.
 * Unterstützt die Verarbeitung von Binärdateien wie JPG.
 * @param filePath - Der Pfad zur Datei.
 * @param app - Das Obsidian-App-Objekt.
 * @returns Ein Objekt mit den extrahierten Metadaten.
 * @throws Fehler, falls die Datei nicht lesbar oder ungültig ist oder keine Metadaten gefunden werden.
 */
export async function extractMetadata(filePath: string, app: App): Promise<Record<string, any>> {
  try {
    // Datei im Vault finden
    const file = app.vault.getAbstractFileByPath(filePath) as TFile;
    if (!file) {
      throw new Error(`File not found: ${filePath}`);
    }

    // Dateiinhalt als Binärdaten lesen
    const binaryData = await readBinaryFile(file, app);

    // XMP-Daten extrahieren
    const xmpData = extractXMPData(binaryData);

    if (!xmpData) {
      throw new Error(`No XMP metadata found in file: ${filePath}`);
    }

    // Metadaten parsen
    const metadata = parseMetadata(xmpData);

    // Überprüfen, ob Metadaten vorhanden sind
    if (!metadata || Object.keys(metadata).length === 0) {
      throw new Error(`No metadata found in file: ${filePath}`);
    }

    return metadata;
  } catch (error) {
    throw new Error(`Failed to extract metadata from file "${filePath}": ${error.message}`);
  }
}

/**
 * Extrahiert spezifische Metadaten aus einer Datei.
 * @param filePath - Der Pfad zur Datei.
 * @param keys - Eine Liste von Metadaten-Schlüsseln, die extrahiert werden sollen.
 * @param app - Das Obsidian-App-Objekt.
 * @returns Ein Objekt mit den extrahierten spezifischen Metadaten.
 */
export async function extractSpecificMetadataFromFile(
  filePath: string,
  keys: string[],
  app: App
): Promise<Record<string, any>> {
  const allMetadata = await extractMetadata(filePath, app);

  // Reduziere auf die spezifischen Schlüssel
  return keys.reduce((result, key) => {
    if (allMetadata[key]) {
      result[key] = allMetadata[key];
    }
    return result;
  }, {} as Record<string, any>);
}

/**
 * Liest eine Datei als Binärdaten.
 * @param file - Die Datei, die gelesen werden soll.
 * @param app - Die Obsidian-App-Instanz.
 * @returns Ein Uint8Array mit den Binärdaten der Datei.
 */
async function readBinaryFile(file: TFile, app: App): Promise<Uint8Array> {
  const arrayBuffer = await app.vault.readBinary(file);
  return new Uint8Array(arrayBuffer);
}

/**
 * Extrahiert XMP-Daten aus Binärdaten.
 * @param binaryData - Die Binärdaten der Datei.
 * @returns Ein XML-String mit den XMP-Daten oder null, falls keine gefunden wurden.
 */
function extractXMPData(binaryData: Uint8Array): string | null {
  const binaryString = new TextDecoder().decode(binaryData);

  const xmpStart = binaryString.indexOf('<x:xmpmeta');
  const xmpEnd = binaryString.indexOf('</x:xmpmeta>');

  if (xmpStart !== -1 && xmpEnd !== -1) {
    return binaryString.substring(xmpStart, xmpEnd + '</x:xmpmeta>'.length);
  }

  return null;
}
