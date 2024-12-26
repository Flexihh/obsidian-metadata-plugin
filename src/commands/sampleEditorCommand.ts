import { Command, Editor, MarkdownView } from 'obsidian';

export const sampleEditorCommand: Command = {
    id: 'sample-editor-command',
    name: 'Sample editor command',
    editorCallback: (editor: Editor, view: MarkdownView) => {
        console.log(editor.getSelection());
        editor.replaceSelection('Sample Editor Command');
    }
};