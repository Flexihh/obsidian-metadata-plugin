import { Command, MarkdownView } from 'obsidian';
import { SampleModal } from '../ui/modals/SampleModal';

export const openSampleModalCommand: Command = {
    id: 'open-sample-modal-complex',
    name: 'Open sample modal (complex)',
    checkCallback: (checking: boolean, app) => {
        const markdownView = app.workspace.getActiveViewOfType(MarkdownView);
        if (markdownView) {
            if (!checking) {
                new SampleModal(app).open();
            }
            return true;
        }
    }
};