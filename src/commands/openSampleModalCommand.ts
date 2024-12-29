import { App, Command, MarkdownView } from 'obsidian';
import { SampleModal } from '../components/SampleModal';

export const openSampleModalCommand: Command = {
    id: 'open-sample-modal-complex',
    name: 'Open sample modal (complex)',
    checkCallback: (checking: boolean) => {
        const app = window.app as App;
        const markdownView = app.workspace.getActiveViewOfType(MarkdownView);
        
        if (markdownView) {
            if (!checking) {
                new SampleModal(app).open();
            }
            return true;
        }
        return false;
    }
};