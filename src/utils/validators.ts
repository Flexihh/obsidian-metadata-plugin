import {
  METADATA_KEY_MAPPING,
  FILE_FORMATS,
  METADATA_KEYS,
  VALID_NAMESPACES
} from '../constants';
import type {
  FileFormat,
  ValidationError,
  MetadataOriginalKey,
  MetadataStandardKey,
  MetadataNamespace
} from '../types';

/**
 * Validiert das Dateiformat.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff')
 * @returns Boolean, ob das Dateiformat unterstützt wird.
 */
export function isValidFileType(fileType: string): fileType is FileFormat {
  return FILE_FORMATS.includes(fileType as FileFormat);
}

/**
 * Validiert den Metadaten-Typ.
 * Unterstützt sowohl spezifische Schlüssel als auch Namespaces.
 * @param metadataType - Typ der Metadaten (z. B. 'dc:subject', 'xmpMM:History')
 * @returns Boolean, ob der Metadaten-Typ unterstützt wird.
 */
export function isValidMetadataType(metadataType: string): boolean {
  // Prüfen, ob der Schlüssel einen validen Namespace enthält
  const [namespace] = metadataType.split(':') as [keyof MetadataNamespace | string];
  
  // Prüfen gegen die definierten Namespaces aus den Constants
  if (VALID_NAMESPACES.includes(namespace as keyof MetadataNamespace)) {
    return true;
  }

  // Prüfen, ob der Schlüssel in METADATA_KEYS enthalten ist
  return METADATA_KEYS.includes(metadataType as MetadataOriginalKey);
}

/**
 * Validiert ein Metadaten-Objekt.
 * Prüft sowohl Original- als auch standardisierte Schlüssel.
 * @param metadata - Metadaten, die geprüft werden sollen.
 * @returns Boolean, ob das Metadaten-Objekt gültig ist.
 */
export function validateMetadata(metadata: Record<string, unknown>): boolean {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    console.warn('Metadata is not a valid object:', metadata);
    return false;
  }

  // Alle gültigen Keys (Original und standardisiert)
  const allValidKeys = new Set<MetadataOriginalKey | MetadataStandardKey>([
    ...METADATA_KEYS,
    ...Object.values(METADATA_KEY_MAPPING)
  ]);

  // Prüfe auf mindestens einen gültigen Schlüssel
  const hasValidKeys = Object.keys(metadata).some(key => 
    allValidKeys.has(key as MetadataOriginalKey | MetadataStandardKey)
  );

  if (!hasValidKeys) {
    console.warn('No valid metadata keys found');
    return false;
  }

  return true;
}

/**
 * Validiert ein vollständiges Metadaten-Objekt und gibt detaillierte Ergebnisse zurück.
 * @param metadata - Metadaten, die geprüft werden sollen.
 * @returns Ein Objekt mit Validierungsergebnissen.
 */
export function validateDetailedMetadata(
  metadata: Record<string, unknown>
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Grundlegende Objektvalidierung
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {
      isValid: false,
      errors: [{
        field: 'metadata',
        message: 'Input must be a valid object'
      }]
    };
  }

  // Alle gültigen Keys (Original und standardisiert)
  const allValidKeys = new Set<MetadataOriginalKey | MetadataStandardKey>([
    ...METADATA_KEYS,
    ...Object.values(METADATA_KEY_MAPPING)
  ]);

  // Prüfe jeden Key im Metadata-Objekt
  const invalidKeys = Object.keys(metadata).filter(key => 
    !allValidKeys.has(key as MetadataOriginalKey | MetadataStandardKey)
  );

  // Sammle Fehler für ungültige Keys
  invalidKeys.forEach(key => {
    errors.push({
      field: key,
      message: `Invalid metadata key: ${key}`
    });
  });

  // Prüfe Werttypen für bekannte Metadaten
  Object.entries(metadata).forEach(([key, value]) => {
    if (allValidKeys.has(key as MetadataOriginalKey | MetadataStandardKey)) {
      if (value === null || value === undefined) {
        errors.push({
          field: key,
          message: `Value for ${key} cannot be null or undefined`
        });
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}