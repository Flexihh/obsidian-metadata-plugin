/**
 * Persistenter Cache für Metadaten im Metadata Manager Plugin (obsidian-kompatibel)
 */

import { MetadataCacheEntry } from '../types';
import { CACHE_CONFIG } from '../config';
import { App, TFile } from 'obsidian';

const CACHE_FILE_NAME = '.metadataCache.json';

class PersistentCache {
  private cache: Map<string, MetadataCacheEntry>;
  private maxEntries: number;
  private expirationTime: number; // in Sekunden
  private app: App;

  constructor(app: App) {
    this.cache = new Map();
    this.maxEntries = CACHE_CONFIG.maxEntries;
    this.expirationTime = CACHE_CONFIG.expirationTime;
    this.app = app;

    this.loadCache();
  }

  /**
   * Lädt den Cache aus einer Datei im Vault.
   */
  private async loadCache(): Promise<void> {
    const cacheFile = this.app.vault.getAbstractFileByPath(CACHE_FILE_NAME) as TFile;

    if (cacheFile) {
      const fileContent = await this.app.vault.read(cacheFile);
      const parsedCache = JSON.parse(fileContent) as MetadataCacheEntry[];

      parsedCache.forEach((entry) => {
        if (new Date(entry.lastUpdated).getTime() > Date.now() - this.expirationTime * 1000) {
          this.cache.set(entry.filePath, entry);
        }
      });
    }
  }

  /**
   * Speichert den Cache in einer Datei im Vault.
   */
  private async saveCache(): Promise<void> {
    const cacheArray = Array.from(this.cache.values());
    const cacheFile = this.app.vault.getAbstractFileByPath(CACHE_FILE_NAME) as TFile;

    if (cacheFile) {
      await this.app.vault.modify(cacheFile, JSON.stringify(cacheArray, null, 2));
    } else {
      await this.app.vault.create(CACHE_FILE_NAME, JSON.stringify(cacheArray, null, 2));
    }
  }

  /**
   * Fügt einen neuen Eintrag zum Cache hinzu.
   * @param key - Der Schlüssel für den Cache (z. B. Dateipfad).
   * @param entry - Der zu speichernde Cache-Eintrag.
   */
  async set(key: string, entry: MetadataCacheEntry): Promise<void> {
    if (this.cache.size >= this.maxEntries) {
      this.evictOldest();
    }
    this.cache.set(key, { ...entry, lastUpdated: new Date() });
    await this.saveCache();
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
   * Gibt den gesamten Inhalt des Caches zurück.
   * @returns Eine Liste mit allen Cache-Einträgen.
   */
  getAll(): MetadataCacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Entfernt einen Eintrag aus dem Cache.
   * @param key - Der Schlüssel des zu entfernenden Eintrags.
   */
  async delete(key: string): Promise<void> {
    this.cache.delete(key);
    await this.saveCache();
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

export function createPersistentCache(app: App): PersistentCache {
  return new PersistentCache(app);
}
