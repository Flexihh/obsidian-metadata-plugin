/**
 * Persistenter Cache für Metadaten im Metadata Manager Plugin (optional)
 */

import { MetadataCacheEntry } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { CACHE_CONFIG } from '../config';

const CACHE_FILE_PATH = path.join(__dirname, '../../.cache/metadataCache.json');

class PersistentCache {
  private cache: Map<string, MetadataCacheEntry>;
  private maxEntries: number;
  private expirationTime: number; // in Sekunden

  constructor() {
    this.cache = new Map();
    this.maxEntries = CACHE_CONFIG.maxEntries;
    this.expirationTime = CACHE_CONFIG.expirationTime;
    this.loadCache();
  }

  /**
   * Lädt den Cache aus einer Datei.
   */
  private loadCache(): void {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      const fileContent = fs.readFileSync(CACHE_FILE_PATH, 'utf-8');
      const parsedCache = JSON.parse(fileContent) as MetadataCacheEntry[];
      parsedCache.forEach((entry) => {
        if (new Date(entry.lastUpdated).getTime() > Date.now() - this.expirationTime * 1000) {
          this.cache.set(entry.filePath, entry);
        }
      });
    }
  }

  /**
   * Speichert den Cache in eine Datei.
   */
  private saveCache(): void {
    const cacheArray = Array.from(this.cache.values());
    fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheArray, null, 2), 'utf-8');
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
    this.saveCache();
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
      this.saveCache();
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
    this.saveCache();
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
      this.saveCache();
    }
  }
}

export const persistentCache = new PersistentCache();
