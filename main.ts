import { App, Plugin, TFile, Command } from 'obsidian';
import { MetadataPluginSettings, DEFAULT_SETTINGS } from './src/settings';
import { MetadataPluginSettingTab } from './src/settings';
import { MetadataView } from './src/components/metadataView';
import { initializeMetadataSystem } from './src/initializer';
import { MetadataManager } from './src/metadataManager';
import { registerShowFileSubjectsCommand } from './src/commands/showSubjectsCommand';
import createCopyRowCommand from './src/commands';
import './src/global.css';
import { TableRow } from './src/types';

// Erweitern des App Interface für TypeScript
declare module "obsidian" {
    interface App {
        commands: {
            executeCommandById(id: string): boolean;
            commands: Record<string, Command>;
        }
    }
}

export default class MetadataPlugin extends Plugin {
    settings: MetadataPluginSettings;
    metadataManager: MetadataManager;
    private observer: MutationObserver | null = null;
    private rows: TableRow[] = [];
    private activeRowId: number | null = null;

    async onload() {
        this.metadataManager = new MetadataManager(this.app);
        await this.initializeSettings();
        this.initializeCommands();
        this.setupImageObserver();

        try {
            await initializeMetadataSystem(this.app);
        } catch (error) {
            console.error('Fehler bei der Initialisierung des Metadaten-Managementsystems:', error);
        }
    }

    private initializeCommands() {
        // Actions sind bereits in this.settings.actions verfügbar
        for (const action of this.settings.actions) {
            this.addCommand({
                id: action.command,
                name: action.name,
                callback: () => this.executeCommand(action.command),
                checkCallback: action.showInCommandPalette ? undefined : () => false
            });
        }
    
        // Copy Row Command mit Factory
        const copyRowCommand = createCopyRowCommand(
            () => this.getRows(),
            () => this.activeRowId
        );
        this.addCommand(copyRowCommand);
    
        // Register additional commands
        registerShowFileSubjectsCommand(this);
    }

    // Execute any command (plugin or system)
    executeCommand(commandId: string, rowId?: number): boolean {
        this.setActiveRow(rowId);
        
        try {
            // Get the command from app.commands
            const command = this.app.commands.commands[commandId];
            
            if (!command) {
                console.warn(`Command ${commandId} not found`);
                return false;
            }

            // Execute the command based on its type
            if (command.callback) {
                const result = command.callback();
                return result === true; // Konvertiert undefined/void zu false
            }

            return false;
        } catch (error) {
            console.error(`Failed to execute command ${commandId}:`, error);
            return false;
        }
    }


    // Row Management
    setActiveRow(rowId?: number) {
        this.activeRowId = rowId ?? null;
    }

    updateRows(rows: TableRow[]) {
        this.rows = rows;
    }

    getRows() {
        return this.rows;
    }

    async initializeSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        this.addSettingTab(new MetadataPluginSettingTab(this.app, this));
    }

    async saveSettings() {
        await this.saveData(this.settings);
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
            return;
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

        const metadataView = new MetadataView(
            this.app,
            this,
            this.settings.actions
        );
        metadataView.render(metadataContainer, file.path);
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
}