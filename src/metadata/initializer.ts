import { App, TFile } from 'obsidian';
import { extractMetadata } from '../metadata/functions/extractXMP'; // Neue Funktion importieren
import { metadataCache } from './cache/metadataCache'; // Direktes Importieren der Cache-Instanz
import { FILE_FORMATS } from './constants';
import { read } from './api/read';

/**
 * Initialisiert das Metadaten-Managementsystem in Obsidian.
 * Findet Dateien im Obsidian-Vault, extrahiert Metadaten, speichert sie im Cache,
 * und liest Metadaten aus dem Cache zur Überprüfung.
 * @param app - Die Obsidian-App-Instanz.
 */
export async function initializeMetadataSystem(app: App): Promise<void> {
  const { vault } = app;

  console.info('Starte Initialisierung des Metadaten-Systems...');

  // Suche nach unterstützten Dateien im Vault
  const files = vault.getFiles().filter((file: TFile) =>
    FILE_FORMATS.includes(file.extension.toLowerCase())
  );

  console.info(`Gefundene Dateien: ${files.length}`);

  for (const file of files) {
    try {
      // Hybrid-Metadaten extrahieren (original und standardisiert)
      const hybridMetadata = await extractMetadata(file.path, app);

      // Cache aktualisieren mit filePath, fileType und Hybrid-Metadaten
      metadataCache.updateCache(file.path, file.extension, hybridMetadata);

      console.info(`Metadaten für ${file.path} erfolgreich verarbeitet.`);
    } catch (error) {
      console.error(`Fehler beim Verarbeiten der Datei ${file.path}:`, error);
    }
  }

  console.info('Initialisierung abgeschlossen. Starte Cache-Überprüfung...');

  // Überprüfung des Caches durch Lesen der Metadaten
  for (const file of files) {
    try {
      // App-Objekt als zweiten Parameter übergeben
      const cachedMetadata = await read('all', app, file.path, file.extension, true);
      console.info(`Metadaten im Cache für ${file.path}:`, cachedMetadata);
    } catch (error) {
      console.error(`Fehler beim Lesen der Metadaten für ${file.path}:`, error);
    }
  }

  console.info('Metadaten-System erfolgreich initialisiert.');
}
