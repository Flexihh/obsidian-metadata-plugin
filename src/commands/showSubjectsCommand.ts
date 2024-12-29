import { App, Notice, TFile, Plugin } from 'obsidian';
import { getFileTypeFromPath } from '../metadata/utils/fileHelpers';
import { MetadataManager } from '../metadata/api/metadataManager';

interface PluginWithMetadataManager extends Plugin {
    metadataManager: MetadataManager;
}

/**
 * Registriert den Command zum Anzeigen der Subjects der aktuellen Datei.
 * @param plugin - Die Plugin-Instanz mit MetadataManager.
 */
export function registerShowFileSubjectsCommand(plugin: PluginWithMetadataManager) {
    plugin.addCommand({
        id: 'show-subjects-of-current-file',
        name: 'Show Subjects of Current File',
        checkCallback: (checking: boolean) => {
            const activeFile = plugin.app.workspace.getActiveFile();

            if (activeFile && !checking) {
                showSubjectsForFile(plugin.app, plugin.metadataManager, activeFile);
            }

            return !!activeFile; // Aktiviert den Command nur, wenn eine Datei geöffnet ist
        },
    });
}

/**
 * Zeigt die Subjects der aktuellen Datei an und erstellt eine neue Notiz.
 * @param app - Die Obsidian-App-Instanz.
 * @param metadataManager - Die MetadataManager-Instanz.
 * @param file - Die aktuell aktive Datei.
 */
async function showSubjectsForFile(app: App, metadataManager: MetadataManager, file: TFile) {
    try {
        const filePath = file.path;

        // Ermitteln und Validieren des Dateityps
        const fileType = getFileTypeFromPath(filePath);
        if (!fileType) {
            new Notice('Unsupported or invalid file type for the current file.');
            return;
        }

        // Abrufen der `subject`-Metadaten
        const subjects = await metadataManager.getMetadataTypeByFile(
            filePath,
            fileType,
            'subject',
            true
        );

        if (!subjects || subjects.length === 0) {
            new Notice('No subjects found for the current file.');
            return;
        }

        // Erstellen einer neuen Notiz mit den `subject`-Daten
        const noteContent = `Subjects for file: ${filePath}\n\n${subjects.join('\n')}`;
        const newFileName = `Subjects_${file.name}.md`;

        const newFile = await app.vault.create(newFileName, noteContent);
        new Notice('Subjects note created successfully!');

        // Öffnen der neuen Notiz im Editor
        await app.workspace.getLeaf().openFile(newFile);
    } catch (error) {
        console.error('Error fetching subjects:', error);
        new Notice('Failed to fetch subjects. Check the console for details.');
    }
}
