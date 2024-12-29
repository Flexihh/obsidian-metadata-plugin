import { Plugin, TFile, Notice } from 'obsidian';
import { MetadataPluginSettings, DEFAULT_SETTINGS } from './src/types';
import { MetadataView } from './src/views/metadataView'; // Geänderte MetadataView für Inline-Rendering
import { SampleSettingTab } from './src/ui/settings/SampleSettingTab';
import { commands } from './src/commands';
import { initializeMetadataSystem } from './src/metadata/initializer';
import { MetadataManager } from './src/metadata/api/metadataManager';
import { registerShowFileSubjectsCommand } from './src/commands/showSubjectsCommand';
import './src/global.css';

export default class MetadataPlugin extends Plugin {
    settings: MetadataPluginSettings;
    metadataManager: MetadataManager; // Instanz des MetadataManagers
    private observer: MutationObserver | null = null; // Observer für DOM-Änderungen

    async onload() {
        console.log('MetadataPlugin loading...');

        // Initialisiere den MetadataManager
        this.metadataManager = new MetadataManager(this.app);
        console.log('MetadataManager initialized.');

        this.initializeSettings();
        this.initializeCommands();
        this.setupImageObserver();

        // Initialisiere das Metadaten-Managementsystem
        try {
            console.log('Starte Initialisierung des Metadaten-Managementsystems...');
            await initializeMetadataSystem(this.app);
            console.log('Metadaten-Managementsystem erfolgreich initialisiert.');
        } catch (error) {
            console.error('Fehler bei der Initialisierung des Metadaten-Managementsystems:', error);
        }

        console.log('MetadataPlugin loaded successfully.');
    }

    setupImageObserver() {
        console.log('Setting up DOM observer for images...');
        this.observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof HTMLImageElement) {
                            this.attachMetadataView(node);
                        }
                    });
                }
            }
        });

        this.observer.observe(document.body, { childList: true, subtree: true });
        console.log('DOM observer for images set up successfully.');
    }

    attachMetadataView(imageElement: HTMLImageElement) {
        const container = imageElement.parentElement;
        if (!container || container.querySelector('.metadata-view-container')) {
            return; // Metadaten-Ansicht bereits vorhanden
        }

        // Extrahiere den Dateipfad aus dem `src`-Attribut des Bildes
        const filePath = imageElement.getAttribute('src');
        if (!filePath) {
            console.warn('Image element has no src attribute:', imageElement);
            return;
        }

        // Bereinige den Dateipfad
        const sanitizedFilePath = this.sanitizeFilePath(filePath);

        // Suche die Datei im Vault
        const file = this.app.vault.getAbstractFileByPath(sanitizedFilePath);
        if (!file || !(file instanceof TFile)) {
            console.warn(`File not found in vault for path: "${sanitizedFilePath}"`);
            return;
        }

        const metadataContainer = document.createElement('div');
        metadataContainer.classList.add('metadata-view-container');
        container.appendChild(metadataContainer);

        // MetadataView-Rendering
        const metadataView = new MetadataView(this.app);
        metadataView.render(metadataContainer, file.path); // Übergebe den Dateipfad
    }

    /**
     * Bereinigt den Dateipfad, um ihn relativ zum Vault zu machen.
     * @param filePath - Der ursprüngliche Dateipfad.
     * @returns Der bereinigte, relative Pfad.
     */
    private sanitizeFilePath(filePath: string): string {
        try {
            // Entfernt Präfixe wie `app://` und Query-Parameter
            const sanitizedPath = filePath.split('?')[0].replace(/^app:\/\/[a-f0-9]+\/Users\/[a-zA-Z0-9_-]+\/obsidian\/vault\//, '');
            return sanitizedPath;
        } catch (error) {
            console.error(`Fehler beim Bereinigen des Dateipfads: "${filePath}"`, error);
            return filePath;
        }
    }

    onunload() {
        console.log('MetadataPlugin unloading...');
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        console.log('MetadataPlugin unloaded successfully.');
    }

    private initializeCommands() {
        console.log('Registering commands...');
        commands.forEach(command => {
            console.log('Adding command:', command.name);
            this.addCommand(command);
        });

        // Registriere den neuen Command für die Anzeige der Subjects
        registerShowFileSubjectsCommand(this);
        console.log('Commands registered successfully.');
    }

    private initializeSettings() {
        console.log('Initializing settings tab...');
        this.addSettingTab(new SampleSettingTab(this.app, this));
        console.log('Settings tab initialized.');
    }
}
