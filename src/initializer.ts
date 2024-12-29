import { App } from 'obsidian';
import { isValidFileType } from './utils/validators'; // Validierungsfunktion importieren
import { processFile } from './fileProcessor';

/**
 * Initialisiert das Metadaten-Managementsystem.
 * @param app - Die Obsidian-App-Instanz.
 */
export async function initializeMetadataSystem(app: App): Promise<void> {
  const { vault } = app;
  const files = vault.getFiles();

  for (const file of files) {
    // Prüfe, ob der Dateityp unterstützt wird
    if (!isValidFileType(file.extension.toLowerCase())) {
      continue;
    }

    try {
      // Übergibt jede Datei an die Prozess-Pipeline
      await processFile(file, app);
    } catch (error) {
      console.error(`Fehler beim Verarbeiten der Datei "${file.path}":`, error);
    }
  }
}
