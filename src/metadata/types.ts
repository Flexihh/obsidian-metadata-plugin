// types.ts
/**
 * Zentrale Typdefinitionen für das Metadata Manager Plugin
 */

// Unterstützte Dateitypen
export type FileType = 'jpg' | 'png' | 'tiff';

// Metadaten-Typen
export type MetadataType =
  | 'author'
  | 'title'
  | 'keywords'
  | 'description'
  | 'date'
  | 'gps'
  | 'custom';


  export type HybridMetadata = {
    original: Record<string, any>;
    standardized: Record<string, any>;
  };

// Cache-Eintrag für Metadaten
export interface MetadataCacheEntry {
  filePath: string;          // Pfad zur Datei
  fileType: string;          // Dateityp (z. B. 'jpg', 'png')
  metadata: Record<string, any>; // Metadaten der Datei
  lastUpdated: Date;         // Zeitstempel der letzten Aktualisierung
}

// Konfiguration für Caching
export interface CacheConfig {
  maxEntries: number;
  expirationTime: number; // in Sekunden
}

// Validierungsfehler
export interface ValidationError {
  field: string;
  message: string;
}

// Metadaten-Spezifikationen
export interface MetadataSpecification {
  exif?: string[];
  iptc?: string[];
  xmp?: string[];
  geoTiff?: string[];
}

export interface FormatNotes {
  [key: string]: string[];
}
