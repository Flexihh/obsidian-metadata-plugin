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
 * @param metadataType - Typ der Metadaten (z. B. 'author', 'title')
 * @returns Boolean, ob der Metadaten-Typ unterstützt wird.
 */
export function isValidMetadataType(metadataType: string): boolean {
  return METADATA_KEYS.includes(metadataType as MetadataType);
}

/**
 * Validiert ein Metadaten-Objekt.
 * @param metadata - Metadaten, die geprüft werden sollen.
 * @returns Boolean, ob das Metadaten-Objekt gültig ist.
 */
export function validateMetadata(metadata: Record<string, any>): boolean {
  return Object.keys(metadata).every((key) => isValidMetadataType(key));
}
