import { Command } from 'obsidian';
import { openMetadataViewCommand } from './openMetadataViewCommand';
import { sampleEditorCommand } from './sampleEditorCommand';
import { openSampleModalCommand } from './openSampleModalCommand';

export const commands: Command[] = [
    openMetadataViewCommand,
    sampleEditorCommand,
    openSampleModalCommand
];