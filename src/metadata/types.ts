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

// Cache-Eintrag für Metadaten
export interface MetadataCacheEntry {
  filePath: string;
  fileType: FileType;
  metadata: Partial<Record<MetadataType, any>>;
  lastUpdated: Date;
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
