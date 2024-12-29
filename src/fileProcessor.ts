import { App, TFile } from 'obsidian';
import { extractMetadata } from './functions/extractMetadata'; // Nur XMP-Daten extrahieren
import { parseMetadata } from './functions/parseMetadata'; // XML-Daten parsen
import { standardizeMetadata } from './functions/standardizeMetadata'; // Standardisieren der Metadaten
import { metadataCache } from './functions/cacheMetadata'; // Cache-Management

/**
 * Verarbeitet eine einzelne Datei durch die gesamte Pipeline.
 * @param file - Die zu verarbeitende Datei.
 * @param app - Die Obsidian-App-Instanz.
 */
export async function processFile(file: TFile, app: App): Promise<void> {
  console.info(`Starte Verarbeitung für Datei: "${file.path}"`);

  try {
    // 1. Dateiinhalt als Binärdaten lesen
    console.info(`Lese Datei "${file.path}" als Binärdaten.`);
    const arrayBuffer = await app.vault.readBinary(file);
    const binaryData = new Uint8Array(arrayBuffer);
    console.info(`Datei erfolgreich gelesen. Größe: ${binaryData.length} Bytes.`);

    // 2. Nur XMP-Daten extrahieren
    console.info(`Versuche, XMP-Daten aus "${file.path}" zu extrahieren.`);
    const xmpData = extractMetadata(binaryData);
    if (!xmpData) {
      console.warn(`Keine XMP-Daten in Datei "${file.path}" gefunden.`);
      return; // Überspringe diese Datei
    }
    console.info(`XMP-Daten erfolgreich extrahiert.`);

    // 3. XMP-Daten parsen
    console.info(`Parsen der XMP-Daten für "${file.path}".`);
    const rawMetadata = parseMetadata(xmpData);
    if (!rawMetadata || Object.keys(rawMetadata).length === 0) {
      throw new Error(`Keine Metadaten nach Parsing für "${file.path}" gefunden.`);
    }
    console.info(`XMP-Daten erfolgreich geparst.`);

    // 4. Standardisierte Metadaten erstellen
    console.info(`Standardisiere Metadaten für "${file.path}".`);
    const standardizedMetadata = standardizeMetadata(rawMetadata);
    console.info(`Metadaten erfolgreich standardisiert.`);

    // 5. Cache aktualisieren
    console.info(`Aktualisiere Cache für "${file.path}".`);
    metadataCache.updateCache(file.path, file.extension, {
      original: rawMetadata,
      standardized: standardizedMetadata,
    });
    console.info(`Cache erfolgreich aktualisiert.`);

    console.info(`Verarbeitung für Datei "${file.path}" abgeschlossen.`);
  } catch (error) {
    console.error(`Fehler bei der Verarbeitung der Datei "${file.path}":`, error instanceof Error ? error.message : error);
  }
}
