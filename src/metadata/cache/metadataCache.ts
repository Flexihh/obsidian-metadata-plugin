/**
 * In-Memory-Cache für Metadaten im Metadata Manager Plugin
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

  /**
   * Fügt einen neuen Eintrag zum Cache hinzu.
   * @param key - Der Schlüssel für den Cache (z. B. Dateipfad).
   * @param entry - Der zu speichernde Cache-Eintrag.
   */
  set(key: string, entry: MetadataCacheEntry): void {
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }
    this.cache.set(key, { ...entry, lastUpdated: new Date() });
  }

  /**
   * Holt einen Eintrag aus dem Cache.
   * @param key - Der Schlüssel des Eintrags.
   * @returns Der Cache-Eintrag oder `undefined`, falls nicht vorhanden.
   */
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

  /**
   * Entfernt einen Eintrag aus dem Cache.
   * @param key - Der Schlüssel des zu entfernenden Eintrags.
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Entfernt den ältesten Eintrag aus dem Cache.
   */
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
