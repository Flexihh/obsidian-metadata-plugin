import { Command } from 'obsidian';
import { VIEW_TYPE_METADATA } from '../constants';

export const openMetadataViewCommand: Command = {
    id: 'open-metadata-view',
    name: 'Open metadata view',
    callback: () => {
        const app = window.app;
        const existing = app.workspace.getLeavesOfType(VIEW_TYPE_METADATA);
        if (existing.length) {
            app.workspace.revealLeaf(existing[0]);
        } else {
            app.workspace.getLeaf(true).setViewState({
                type: VIEW_TYPE_METADATA,
            });
        }
    }
};