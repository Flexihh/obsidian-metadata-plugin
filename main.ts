import { Plugin, TFile } from 'obsidian';
import { MetadataPluginSettings, DEFAULT_SETTINGS } from './src/types';
import { MetadataView } from './src/components/metadataView'; // Geänderte MetadataView für Inline-Rendering
import { SampleSettingTab } from './src/components/SampleSettingTab';
import { commands } from './src/commands';
import { initializeMetadataSystem } from './src/initializer';
import { MetadataManager } from './src/metadataManager';
import { registerShowFileSubjectsCommand } from './src/commands/showSubjectsCommand';
import './src/global.css';

export default class MetadataPlugin extends Plugin {
    settings: MetadataPluginSettings;
    metadataManager: MetadataManager; // Instanz des MetadataManagers
    private observer: MutationObserver | null = null; // Observer für DOM-Änderungen

    async onload() {
        this.metadataManager = new MetadataManager(this.app);

        this.initializeSettings();
        this.initializeCommands();
        this.setupImageObserver();

        try {
            await initializeMetadataSystem(this.app);
        } catch (error) {
            console.error('Fehler bei der Initialisierung des Metadaten-Managementsystems:', error);
        }
    }

    setupImageObserver() {
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
    }

    attachMetadataView(imageElement: HTMLImageElement) {
        const container = imageElement.parentElement;
        if (!container || container.querySelector('.metadata-view-container')) {
            return; // Metadaten-Ansicht bereits vorhanden
        }

        const filePath = imageElement.getAttribute('src');
        if (!filePath) {
            return;
        }

        const sanitizedFilePath = this.sanitizeFilePath(filePath);
        const file = this.app.vault.getAbstractFileByPath(sanitizedFilePath);
        if (!file || !(file instanceof TFile)) {
            return;
        }

        const metadataContainer = document.createElement('div');
        metadataContainer.classList.add('metadata-view-container');
        container.appendChild(metadataContainer);

        const metadataView = new MetadataView(this.app);
        metadataView.render(metadataContainer, file.path); // Übergebe den Dateipfad
    }

    private sanitizeFilePath(filePath: string): string {
        try {
            const sanitizedPath = filePath.split('?')[0].replace(/^app:\/\/[a-f0-9]+\/Users\/[a-zA-Z0-9_-]+\/obsidian\/vault\//, '');
            return sanitizedPath;
        } catch (error) {
            return filePath;
        }
    }

    onunload() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
    }

    private initializeCommands() {
        commands.forEach(command => {
            this.addCommand(command);
        });

        registerShowFileSubjectsCommand(this);
    }

    private initializeSettings() {
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }
}
