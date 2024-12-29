import { App } from 'obsidian';
import { read } from './api/read';
import type {
  HybridMetadata,
  MetadataOriginalKey,
  MetadataStandardKey,
  FileFormat,
} from './types';

type MetadataReadType = 'all' | 'list' | 'subject' | MetadataStandardKey;
type MetadataResult = HybridMetadata | string[] | Partial<Record<MetadataStandardKey, unknown>>;

/**
 * Manager für Metadaten-Operationen.
 */
export class MetadataManager {
    private app: App;
    private debug: boolean = true;

    constructor(app: App) {
        this.app = app;
        this.log('MetadataManager initialized');
    }

    private log(...args: unknown[]): void {
        if (this.debug) {
            console.log('[MetadataManager]', ...args);
        }
    }

    private error(...args: unknown[]): void {
        console.error('[MetadataManager]', ...args);
    }

    /**
     * Liest alle verfügbaren Metadaten-Keys aus einer Datei.
     */
    async readMetadataKeysFromFile(
        filePath: string,
        fileType: FileFormat,
        useCache = true
    ): Promise<(MetadataOriginalKey | MetadataStandardKey)[]> {
        this.log('Reading metadata keys from file:', filePath);

        try {
            const keys = await this.getAvailableMetadataTypes(filePath, fileType, useCache);
            return keys;
        } catch (error) {
            this.error('Error reading metadata keys from file:', error);
            return [];
        }
    }

    /**
     * Liest die Werte für spezifische Metadaten-Keys aus einer Datei.
     */
    async readMetadataValuesFromFile(
        filePath: string,
        fileType: FileFormat,
        keys: MetadataStandardKey[],
        useCache = true
    ): Promise<Record<string, unknown>> {
        this.log('Reading metadata values from file:', filePath);

        const metadata: Record<string, unknown> = {};

        try {
            for (const key of keys) {
                const value = await this.readMetadataValueByKey(filePath, key, fileType, useCache);
                metadata[key] = value;
            }
            return metadata;
        } catch (error) {
            this.error('Error reading metadata values from file:', error);
            return {};
        }
    }

    /**
     * Liest alle verfügbaren Metadaten-Keys und deren Werte aus einer Datei.
     */
    async readMetadataFromFile(
        filePath: string,
        fileType: FileFormat,
        useCache = true,
        dataFormat: 'original' | 'standardized' = 'standardized' // Default: standardized
    ): Promise<Record<string, unknown>> {
        this.log(`Reading ${dataFormat} metadata from file:`, filePath);
    
        try {
            // Metadaten aus der Datei lesen
            const metadata = await read(dataFormat, this.app, filePath, fileType, useCache);
            if (typeof metadata === 'object' && !Array.isArray(metadata)) {
                return metadata as Record<string, unknown>;
            } else {
                throw new Error(`Unexpected metadata format for ${dataFormat}`);
            }
        } catch (error) {
            this.error(`Error reading ${dataFormat} metadata from file:`, error);
            return {};
        }
    }
    
    /**
     * Holt alle verfügbaren Metadaten-Typen für eine Datei (interne Funktion).
     */
    private async getAvailableMetadataTypes(
        filePath: string,
        fileType: FileFormat,
        useCache = true
    ): Promise<(MetadataOriginalKey | MetadataStandardKey)[]> {
        this.log('Getting available metadata types for:', filePath);

        try {
            const result = await read('list', this.app, filePath, fileType, useCache);
            if (Array.isArray(result)) {
                return result as (MetadataOriginalKey | MetadataStandardKey)[];
            }
            return [];
        } catch (error) {
            this.error('Error getting available metadata types:', error);
            return [];
        }
    }

    /**
     * Liest den Wert eines spezifischen Metadaten-Keys aus einer Datei (interne Funktion).
     */
    private async readMetadataValueByKey(
        filePath: string,
        metadataKey: MetadataStandardKey,
        fileType: FileFormat,
        useCache = true
    ): Promise<unknown> {
        this.log('Reading metadata value by key:', { filePath, metadataKey });

        try {
            const result = await read(metadataKey, this.app, filePath, fileType, useCache);
            if (result && typeof result === 'object' && !Array.isArray(result)) {
                return result[metadataKey] ?? null;
            }
            return null;
        } catch (error) {
            this.error('Error reading metadata value by key:', error);
            return null;
        }
    }
}
