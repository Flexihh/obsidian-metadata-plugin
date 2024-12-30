import { App } from 'obsidian';
import { Plugin as ObsidianPlugin } from 'obsidian';

/**
 * Zentrale Typdefinitionen für das Metadata Manager Plugin
 */

// Unterstützte Dateitypen
export type FileFormat = 'jpg' | 'png' | 'tiff';

// Namespace Definitionen
export type MetadataNamespace = Record<
  'rdf' | 'dc' | 'xmp' | 'xmpMM' | 'xmpRights' | 'exif' | 'iptc' | 'lr',
  string
>;

// Unterstützte Metadaten-Typen pro Format
export type FormatMetadataType = 'exif' | 'iptc' | 'xmp' | 'textChunks' | 'geoTiff';

// Unterstützte Metadaten pro Format
export type FormatMetadataSupport = Record<FileFormat, readonly FormatMetadataType[]>;

// Metadaten-Original-Keys
export type MetadataOriginalKey =
  | 'dc:subject'
  | 'dc:Description'
  | 'dc:Creator'
  | 'xmpMM:History'
  | 'lr:weightedFlatSubject'
  | 'lr:hierarchicalSubject'
  | 'exif:Make'
  | 'exif:Model'
  | 'exif:LensModel'
  | 'exif:DateTimeOriginal'
  | 'exif:ExposureTime'
  | 'exif:FNumber'
  | 'exif:ISO'
  | 'exif:ShutterSpeedValue'
  | 'exif:FocalLength'
  | 'exif:WhiteBalance'
  | 'exif:SceneType'
  | 'exif:ColorSpace'
  | 'exif:GPSLatitude'
  | 'exif:GPSLongitude'
  | 'xmp:CreatorTool'
  | 'xmp:MetadataDate'
  | 'xmp:Lens'
  | 'xmp:DocumentID'
  | 'xmp:InstanceID'
  | 'xmp:Title'
  | 'xmp:Description'
  | 'xmp:CreateDate'
  | 'iptc:Keywords'
  | 'iptc:DateCreated'
  | 'iptc:TimeCreated'
  | 'iptc:Byline'
  | 'iptc:CopyrightNotice'
  | 'xmpRights:Marked'
  | 'xmpRights:WebStatement';

// Standardisierte Metadaten-Keys
export type MetadataStandardKey =
  | 'subject'
  | 'description'
  | 'author'
  | 'history'
  | 'keywords'
  | 'hierarchicalKeywords'
  | 'cameraMake'
  | 'cameraModel'
  | 'lensModel'
  | 'dateTimeOriginal'
  | 'exposureTime'
  | 'aperture'
  | 'iso'
  | 'shutterSpeed'
  | 'focalLength'
  | 'whiteBalance'
  | 'sceneType'
  | 'colorSpace'
  | 'gpsLatitude'
  | 'gpsLongitude'
  | 'creatorTool'
  | 'metadataDate'
  | 'lens'
  | 'documentId'
  | 'instanceId'
  | 'title'
  | 'xmpDescription'
  | 'createDate'
  | 'iptcKeywords'
  | 'dateCreated'
  | 'timeCreated'
  | 'byline'
  | 'copyright'
  | 'rightsMarked'
  | 'rightsStatement';

// Metadaten-Mapping Typen
export type MetadataKeyMapping = Record<MetadataOriginalKey, MetadataStandardKey>;

// Format-spezifische Metadaten-Konfiguration
export type FormatMetadataConfig = {
  exif?: readonly MetadataOriginalKey[];
  iptc?: readonly MetadataOriginalKey[];
  xmp?: readonly MetadataOriginalKey[];
  textChunks?: readonly string[];
  geoTiff?: readonly string[];
};

// Metadaten-Spezifikationen
export type MetadataSpecification = Record<FileFormat, FormatMetadataConfig>;

// Hybrid-Metadaten Struktur
export type HybridMetadata = {
  original: Partial<Record<MetadataOriginalKey, unknown>>;
  standardized: Partial<Record<MetadataStandardKey, unknown>>;
};

// Cache-Eintrag für Metadaten
export interface MetadataCacheEntry {
  filePath: string;
  fileType: FileFormat;
  metadata: HybridMetadata;
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


// XML-spezifische Types
export type XMLNamespace = {
  prefix: string;
  uri: string;
};

export type XMLOptions = {
  version: string;
  encoding: string;
  standalone?: boolean;
};

export type XMLValidationResult = {
  isValid: boolean;
  errors: string[];
};

// RDF-spezifische Types
export type RDFValue = string | string[] | null | undefined;

export type RDFBagContent = {
  items: string[];
  attributes?: Record<string, string>;
};

export type XMLContent = {
  name: string;
  value: string | RDFBagContent;
  attributes?: Record<string, string>;
};


// Global type extensions
declare global {
    interface Window {
        app: App;
    }
}

// Plugin Settings
export interface MetadataPluginSettings {
    mySetting: string;
    categories: Category[];
    defaultCategory: string;
}

export interface Category {
    value: string;
    label: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { value: 'keywords', label: 'Keywords' },
    { value: 'features', label: 'Funktionen' },
    { value: 'tech', label: 'Technologien' },
    { value: 'requirements', label: 'Anforderungen' }
];

export const DEFAULT_SETTINGS: MetadataPluginSettings = {
    mySetting: 'default',
    categories: DEFAULT_CATEGORIES,
    defaultCategory: 'keywords'
}


export interface CategoryDefinition {
  value: string;
  label: string;
  icon: string;
  displayType: 'pills' | 'text' | 'date' | 'location';
  multiline?: boolean;
  placeholder: string;
  key: string | string[];
}

export interface TableRow {
  isLocked: boolean | undefined;
  id: number;
  category: string;
  tags: string[];
  inputValue: string;
  textContent: string;
  isDeleted?: boolean;
}

export interface MetadataValues {
  subject?: string[];
  keywords?: string[];
  iptcKeywords?: string[];
  hierarchicalKeywords?: string[];
  description?: string;
  author?: string;
  dateTimeOriginal?: string;
  copyright?: string;
  cameraModel?: string;
  gpsLatitude?: string;
  [key: string]: any;
}

export interface Action {
  name: string;
  command: string;
  isSubmenu: boolean;
  showInCommandPalette: boolean;
}



// MetadataPlugin Interface
export interface MetadataPlugin extends ObsidianPlugin {
  settings: {
      actions: Action[];
  };
  executeCommand(commandId: string, rowId?: number): boolean;
  setActiveRow(rowId?: number): void;
  updateRows(rows: TableRow[]): void;
  getRows(): TableRow[];
}