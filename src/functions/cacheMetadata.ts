import {
  METADATA_KEY_MAPPING,
  FILE_FORMATS,
  METADATA_KEYS,
  VALID_NAMESPACES,
} from '../constants';
import { CACHE_CONFIG } from '../config'; 
import type {
  FileFormat,
  MetadataCacheEntry,
  MetadataStandardKey,
  MetadataOriginalKey,
  MetadataNamespace,
} from '../types';

class MetadataCache {
  private cache: Map<string, MetadataCacheEntry>;
  private maxEntries: number;
  private expirationTime: number;

  constructor() {
    this.cache = new Map();
    this.maxEntries = CACHE_CONFIG.maxEntries; // Verwendet CACHE_CONFIG
    this.expirationTime = CACHE_CONFIG.expirationTime; // Verwendet CACHE_CONFIG
  }

  updateCache(filePath: string, fileType: string, metadata: Record<string, unknown>): void {
    // Keine externe Validierung mehr

    // Cache-Eintrag erstellen: Nur die Original-Metadaten speichern
    const updatedEntry: MetadataCacheEntry = {
      filePath,
      fileType: fileType as FileFormat,
      metadata: {
        original: metadata, // Speichert die originalen Metadaten
        standardized: { ...metadata }, // Optional: Kopie der Metadaten ohne tiefere Verschachtelung
      },
      lastUpdated: new Date(),
    };

    // Aktualisieren des Cache-Eintrags
    const existingEntry = this.get(filePath);
    this.set(filePath, existingEntry ? { ...existingEntry, ...updatedEntry } : updatedEntry);
  }

  set(key: string, entry: MetadataCacheEntry): void {
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }
    this.cache.set(key, entry);
  }

  get(key: string): MetadataCacheEntry | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    const ageInSeconds = (new Date().getTime() - entry.lastUpdated.getTime()) / 1000;
    if (ageInSeconds > this.expirationTime) {
      this.cache.delete(key);
      return undefined;
    }

    return entry;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  getAllEntries(): MetadataCacheEntry[] {
    return Array.from(this.cache.values());
  }

  getSnapshot(): Record<string, MetadataCacheEntry> {
    const snapshot: Record<string, MetadataCacheEntry> = {};
    this.cache.forEach((value, key) => {
      snapshot[key] = value;
    });
    return snapshot;
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    this.cache.forEach((entry, key) => {
      const entryAge = entry.lastUpdated.getTime();
      if (entryAge < oldestTime) {
        oldestTime = entryAge;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
}

export const metadataCache = new MetadataCache();
