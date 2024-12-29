import { read } from './read';
import { App } from 'obsidian';

interface StandardizedMetadata {
    subject?: string;
    keywords?: string[];
    hierarchicalKeywords?: string[];
    history?: string;
    [key: string]: any;
}

interface OriginalMetadata {
    'dc:subject'?: string;
    'xmpMM:History'?: string;
    'xmpMM:DerivedFrom'?: string;
    [key: string]: any;
}

interface MetadataCache {
    original?: OriginalMetadata;
    standardized?: StandardizedMetadata;
}

export class MetadataManager {
    private app: App;
    private metadataCache: Map<string, any> = new Map();
    private debug: boolean = true;

    constructor(app: App) {
        this.app = app;
        this.log('MetadataManager initialized');
    }

    private log(...args: any[]): void {
        if (this.debug) {
            console.log('[MetadataManager]', ...args);
        }
    }

    private error(...args: any[]): void {
        console.error('[MetadataManager]', ...args);
    }

    private normalizeMetadataValue(value: any): string[] {
        if (!value) return [];
        
        if (Array.isArray(value)) {
            return value.map(v => this.normalizeString(v)).filter(Boolean);
        }
        
        return [this.normalizeString(value)].filter(Boolean);
    }

    private normalizeString(value: any): string {
        if (value === null || value === undefined) return '';
        return String(value).trim();
    }

    async getAllMetadata(
        filePath: string, 
        fileType: string,
        useCache = true
    ): Promise<MetadataCache> {
        this.log('Getting all metadata:', filePath);
        
        try {
            const cacheKey = `all_${filePath}`;
            
            if (useCache && this.metadataCache.has(cacheKey)) {
                const cachedData = this.metadataCache.get(cacheKey);
                this.log('Using cached metadata:', cachedData);
                return cachedData;
            }

            const rawMetadata = await read('all', this.app, filePath, fileType, useCache);
            this.log('Raw metadata from read:', rawMetadata);

            // Metadaten normalisieren
            const normalizedMetadata: MetadataCache = {
                original: {},
                standardized: {}
            };

            if (rawMetadata?.original) {
                normalizedMetadata.original = rawMetadata.original;
            }

            if (rawMetadata?.standardized) {
                normalizedMetadata.standardized = rawMetadata.standardized;
            }

            this.log('Normalized metadata:', normalizedMetadata);

            if (useCache) {
                this.metadataCache.set(cacheKey, normalizedMetadata);
            }

            return normalizedMetadata;
        } catch (error) {
            this.error('Error getting all metadata:', error);
            return {
                original: {},
                standardized: {}
            };
        }
    }

    async getMetadataByType(
        filePath: string,
        metadataType: string,
        useCache = true
    ): Promise<any> {
        this.log('Getting metadata by type:', { filePath, metadataType });

        try {
            const cacheKey = `${metadataType}_${filePath}`;
            
            if (useCache && this.metadataCache.has(cacheKey)) {
                return this.metadataCache.get(cacheKey);
            }

            const metadata = await read(metadataType, this.app, filePath, undefined, useCache);
            this.log('Raw metadata by type:', metadata);

            const result = metadata?.[metadataType] || null;

            if (useCache) {
                this.metadataCache.set(cacheKey, result);
            }

            return result;
        } catch (error) {
            this.error('Error getting metadata by type:', error);
            return null;
        }
    }

    async getMetadataTypeByFile(
        filePath: string,
        fileType: string,
        metadataType: string,
        useCache = true
    ): Promise<string[]> {
        this.log('Getting metadata by file:', {
            filePath,
            fileType,
            metadataType,
            useCache
        });

        try {
            if (!fileType) {
                throw new Error('File type could not be determined.');
            }

            const cacheKey = `${metadataType}_${filePath}`;
            
            if (useCache && this.metadataCache.has(cacheKey)) {
                const cachedData = this.metadataCache.get(cacheKey);
                this.log('Using cached metadata:', cachedData);
                return cachedData;
            }

            const metadata = await this.getAllMetadata(filePath, fileType, useCache);
            this.log('Retrieved full metadata:', metadata);

            let results: string[] = [];

            // Werte aus original extrahieren
            if (metadata?.original) {
                const originalValue = metadata.original['dc:subject'];
                if (originalValue) {
                    results.push(...this.normalizeMetadataValue(originalValue));
                }
            }

            // Werte aus standardized extrahieren
            if (metadata?.standardized) {
                const std = metadata.standardized;
                
                // Subject
                if (std.subject) {
                    results.push(...this.normalizeMetadataValue(std.subject));
                }

                // Keywords
                if (std.keywords) {
                    results.push(...this.normalizeMetadataValue(std.keywords));
                }

                // Hierarchical Keywords
                if (std.hierarchicalKeywords) {
                    results.push(...this.normalizeMetadataValue(std.hierarchicalKeywords));
                }
            }

            // Duplikate entfernen und sortieren
            results = [...new Set(results)].filter(Boolean).sort();

            this.log('Final processed metadata:', results);

            if (useCache) {
                this.metadataCache.set(cacheKey, results);
            }

            return results;
        } catch (error) {
            this.error('Error getting metadata by file:', error);
            return [];
        }
    }

    async getAvailableMetadataTypes(
        filePath: string,
        fileType: string,
        useCache = true
    ): Promise<string[]> {
        this.log('Getting available types for:', filePath);

        try {
            const cacheKey = `types_${filePath}`;
            
            if (useCache && this.metadataCache.has(cacheKey)) {
                return this.metadataCache.get(cacheKey);
            }

            const metadata = await this.getAllMetadata(filePath, fileType, useCache);
            const types = new Set<string>();

            // Typen aus original sammeln
            if (metadata?.original) {
                Object.keys(metadata.original).forEach(key => types.add(key));
            }

            // Typen aus standardized sammeln
            if (metadata?.standardized) {
                Object.keys(metadata.standardized).forEach(key => types.add(key));
            }

            const results = Array.from(types).sort();
            
            if (useCache) {
                this.metadataCache.set(cacheKey, results);
            }

            return results;
        } catch (error) {
            this.error('Error getting available types:', error);
            return [];
        }
    }

    clearCache(): void {
        this.log('Clearing cache');
        this.metadataCache.clear();
    }

    invalidateCache(filePath?: string): void {
        if (filePath) {
            this.log('Invalidating cache for:', filePath);
            for (const key of this.metadataCache.keys()) {
                if (key.includes(filePath)) {
                    this.metadataCache.delete(key);
                }
            }
        } else {
            this.clearCache();
        }
    }
}