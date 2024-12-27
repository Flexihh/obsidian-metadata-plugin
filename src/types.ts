import { App } from 'obsidian';

// Global type extensions
declare global {
    interface Window {
        app: App;
    }
}

// Plugin Settings
export interface MetadataPluginSettings {
    mySetting: string;
    categories: Category[];
    defaultCategory: string;
}

export interface Category {
    value: string;
    label: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { value: 'keywords', label: 'Keywords' },
    { value: 'features', label: 'Funktionen' },
    { value: 'tech', label: 'Technologien' },
    { value: 'requirements', label: 'Anforderungen' }
];

export const DEFAULT_SETTINGS: MetadataPluginSettings = {
    mySetting: 'default',
    categories: DEFAULT_CATEGORIES,
    defaultCategory: 'keywords'
}