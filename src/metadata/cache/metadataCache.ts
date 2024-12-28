/**
 * In-Memory-Cache für Metadaten im Metadata Manager Plugin.
 */

import { MetadataCacheEntry } from '../types';
import { CACHE_CONFIG } from '../config';



class MetadataCache {
  private cache: Map<string, MetadataCacheEntry>;
  private maxEntries: number;
  private expirationTime: number; // in Sekunden

  constructor() {
    this.cache = new Map();
    this.maxEntries = CACHE_CONFIG.maxEntries;
    this.expirationTime = CACHE_CONFIG.expirationTime;
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

  updateCache(filePath: string, fileType: string, metadata: Record<string, any>): void {
    const existingEntry = this.get(filePath);
    const updatedEntry: MetadataCacheEntry = {
      filePath,
      fileType,
      metadata,
      lastUpdated: new Date(),
    };

    this.set(filePath, existingEntry ? { ...existingEntry, ...updatedEntry } : updatedEntry);
  }

  delete(key: string): void {
    this.cache.delete(key);
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
