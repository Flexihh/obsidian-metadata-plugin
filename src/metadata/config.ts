/**
 * Standardwerte und Konfigurationen für das Metadata Manager Plugin
 */

export const DEFAULT_CACHE_ENABLED = true;
export const SUPPORTED_FILE_TYPES = ['jpg', 'png', 'tiff'];
export const METADATA_TYPES = [
  'author',
  'title',
  'keywords',
  'description',
  'date',
  'gps',
  'custom',
];
export const RDF_NAMESPACES = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dc: 'http://purl.org/dc/elements/1.1/',
};

export const CACHE_CONFIG = {
  maxEntries: 1000,
  expirationTime: 60 * 60 * 24, // 24 Stunden
};
