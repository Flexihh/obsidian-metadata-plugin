import { Plugin, WorkspaceLeaf, Notice } from 'obsidian';
import { MetadataPluginSettings, DEFAULT_SETTINGS } from './src/types';
import { MetadataView, VIEW_TYPE_METADATA } from './src/views/metadataView';
import { SampleSettingTab } from './src/ui/settings/SampleSettingTab';
import { commands } from './src/commands';
import './src/global.css';
import { initializeCache } from './src/metadata/metadata';

export class MetadataPlugin extends Plugin {
    settings: MetadataPluginSettings;

    constructor(app: any, manifest: any) {
        super(app, manifest);
        console.log('MetadataPlugin constructor called');
        console.log('App container (constructor):', (this.app as any).container || 'No container available');
    }

    async onload() {
        console.log('MetadataPlugin loading...');
        console.log('App container (onload):', (this.app as any).container || 'No container available');

        this.initializeViews();
        this.initializeRibbonIcons();
        this.initializeStatusBar();
        this.initializeCommands();
        this.initializeSettings();
        this.initializeEventListeners();

                // Lade und initialisiere den Cache
                initializeCache();  // Dies ruft die Funktion aus metadata.ts auf

        // Add @container class to document body on load
        document.body.toggleClass('@container', true);
        console.log('MetadataPlugin loaded successfully.');
    }

    private initializeViews() {
        console.log('Initializing views...');
        this.registerView(
            VIEW_TYPE_METADATA,
            (leaf: WorkspaceLeaf) => {
                console.log('Registering MetadataView for leaf:', {
                    id: (leaf as any).id || 'No ID available',
                    containerEl: (leaf as any).containerEl || 'No container element',
                    parent: (leaf as any).parent || 'No parent available',
                });
                return new MetadataView(leaf);
            }
        );
    }

    private initializeRibbonIcons() {
        console.log('Adding ribbon icons...');
        
        // Metadata view icon
        this.addRibbonIcon('info', 'Open metadata view', () => {
            console.log('Metadata view ribbon icon clicked.');
            this.openMetadataView();
        });

        // Sample plugin icon
        const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', () => {
            new Notice('This is a notice!');
            console.log('Sample plugin ribbon icon clicked.');
        });
        ribbonIconEl.addClass('my-plugin-ribbon-class');
        console.log('Ribbon icons added successfully.');
    }

    private initializeStatusBar() {
        console.log('Initializing status bar...');
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');
        console.log('Status bar initialized with text:', 'Status Bar Text');
    }

    private initializeCommands() {
        console.log('Registering commands...');
        commands.forEach(command => {
            console.log('Adding command:', command.name);
            this.addCommand(command);
        });
        console.log('Commands registered successfully.');
    }

    private initializeSettings() {
        console.log('Initializing settings tab...');
        this.addSettingTab(new SampleSettingTab(this.app, this));
        console.log('Settings tab initialized.');
    }

    private initializeEventListeners() {
        console.log('Registering DOM and interval events...');
        
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            console.log('Document click event:', evt);
        });

        this.registerInterval(
            window.setInterval(() => console.log('Interval event triggered'), 5 * 60 * 1000)
        );

        document.body.classList.toggle('container', true);
        console.log('Event listeners registered.');
    }

    private openMetadataView() {
        console.log('Opening metadata view...');
        const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_METADATA);
        if (existing.length) {
            console.log('Revealing existing metadata view.');
            this.app.workspace.revealLeaf(existing[0]);
        } else {
            console.log('Creating new metadata view.');
            this.app.workspace.getLeaf(true).setViewState({
                type: VIEW_TYPE_METADATA,
            });
        }
    }

    onunload() {
        console.log('MetadataPlugin unloading...');

        // Remove @container class from document body on unload
        document.body.toggleClass('@container', false);
        console.log('@container class removed from document body.');

        // Also remove the 'container' class for compatibility
        document.body.classList.toggle('container', false);
        console.log('container class removed from document body.');

        console.log('MetadataPlugin unloaded successfully.');
    }

    async loadSettings() {
        console.log('Loading plugin settings...');
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
        console.log('Settings loaded:', this.settings);
    }

    async saveSettings() {
        console.log('Saving plugin settings...');
        await this.saveData(this.settings);
        console.log('Settings saved successfully.');
    }
}

export default MetadataPlugin;
