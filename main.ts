import { App, Plugin, WorkspaceLeaf, Notice } from 'obsidian';
import { MetadataPluginSettings, DEFAULT_SETTINGS } from './src/types';
import { MetadataView, VIEW_TYPE_METADATA } from './src/views/metadataView';
import { SampleModal } from './src/ui/modals/SampleModal';
import { SampleSettingTab } from './src/ui/settings/SampleSettingTab';
import { commands } from './src/commands';

export class MetadataPlugin extends Plugin {
    settings: MetadataPluginSettings;

    async onload() {
        this.initializeViews();
        this.initializeRibbonIcons();
        this.initializeStatusBar();
        this.initializeCommands();
        this.initializeSettings();
        this.initializeEventListeners();
    }

    private initializeViews() {
        this.registerView(
            VIEW_TYPE_METADATA,
            (leaf: WorkspaceLeaf) => new MetadataView(leaf)
        );
    }

    private initializeRibbonIcons() {
        // Metadata view icon
        this.addRibbonIcon('info', 'Open metadata view', () => {
            this.openMetadataView();
        });

        // Sample plugin icon
        const ribbonIconEl = this.addRibbonIcon('dice', 'Sample Plugin', () => {
            new Notice('This is a notice!');
        });
        ribbonIconEl.addClass('my-plugin-ribbon-class');
    }

    private initializeStatusBar() {
        const statusBarItemEl = this.addStatusBarItem();
        statusBarItemEl.setText('Status Bar Text');
    }

    private initializeCommands() {
        commands.forEach(command => {
            this.addCommand(command);
        });
    }

    private initializeSettings() {
        this.addSettingTab(new SampleSettingTab(this.app, this));
    }

    private initializeEventListeners() {
        this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
            console.log('click', evt);
        });

        this.registerInterval(
            window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000)
        );

        document.body.classList.toggle('container', true);
    }

    private openMetadataView() {
        const existing = this.app.workspace.getLeavesOfType(VIEW_TYPE_METADATA);
        if (existing.length) {
            this.app.workspace.revealLeaf(existing[0]);
        } else {
            this.app.workspace.getLeaf(true).setViewState({
                type: VIEW_TYPE_METADATA,
            });
        }
    }

    onunload() {
        document.body.classList.toggle('container', false);
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

export default MetadataPlugin;