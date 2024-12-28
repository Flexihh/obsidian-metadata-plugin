/**
 * Validierungsfunktionen für Dateiformate und Metadaten-Typen
 */

import { FileType, MetadataType } from '../types';
import { FILE_FORMATS, METADATA_KEYS } from '../constants';

/**
 * Validiert das Dateiformat.
 * @param fileType - Typ der Datei (z. B. 'jpg', 'png', 'tiff')
 * @returns Boolean, ob das Dateiformat unterstützt wird.
 */
export function isValidFileType(fileType: string): boolean {
  return FILE_FORMATS.includes(fileType as FileType);
}

/**
 * Validiert den Metadaten-Typ.
 * Unterstützt sowohl spezifische Schlüssel als auch Namespaces.
 * @param metadataType - Typ der Metadaten (z. B. 'dc:subject', 'xmpMM:History')
 * @returns Boolean, ob der Metadaten-Typ unterstützt wird.
 */
export function isValidMetadataType(metadataType: string): boolean {
  const validNamespaces = ['dc', 'lr', 'xmpMM', 'exif', 'iptc', 'xmp', 'xmpRights'];

  // Prüfen, ob der Schlüssel einen validen Namespace enthält
  const [namespace] = metadataType.split(':');
  if (validNamespaces.includes(namespace)) {
    return true;
  }

  // Prüfen, ob der Schlüssel in METADATA_KEYS enthalten ist
  return METADATA_KEYS.includes(metadataType as MetadataType);
}

/**
 * Validiert ein Metadaten-Objekt.
 * @param metadata - Metadaten, die geprüft werden sollen.
 * @returns Boolean, ob das Metadaten-Objekt gültig ist.
 */
export function validateMetadata(metadata: Record<string, any>): boolean {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    console.warn('Metadata is not a valid object:', metadata);
    return false;
  }

  // Sammle ungültige Schlüssel
  const invalidKeys = Object.keys(metadata).filter((key) => !isValidMetadataType(key));

  if (invalidKeys.length > 0) {
    console.warn('Metadata contains invalid keys:', invalidKeys);
  }

  // Akzeptiere Metadaten, wenn mindestens ein gültiger Schlüssel existiert
  const hasValidKeys = Object.keys(metadata).some((key) => isValidMetadataType(key));
  return hasValidKeys;
}

/**
 * Validiert ein vollständiges Metadaten-Objekt und gibt detaillierte Ergebnisse zurück.
 * @param metadata - Metadaten, die geprüft werden sollen.
 * @returns Ein Objekt mit `isValid` und einer Liste ungültiger Schlüssel.
 */
export function validateDetailedMetadata(metadata: Record<string, any>): {
  isValid: boolean;
  invalidKeys: string[];
} {
  const invalidKeys = Object.keys(metadata).filter((key) => !isValidMetadataType(key));

  return {
    isValid: invalidKeys.length === 0,
    invalidKeys,
  };
}
