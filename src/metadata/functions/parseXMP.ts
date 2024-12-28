/**
 * Funktionen zum Parsen von Metadaten aus RDF/XML-Dokumenten
 */

import { RDF_DESCRIPTION_ELEMENT } from '../constants';

/**
 * Parst ein RDF/XML-Dokument und extrahiert die Metadaten.
 * @param xmlString - Der XML-String, der analysiert werden soll.
 * @returns Ein Objekt mit den extrahierten Metadaten.
 */
export function parseMetadata(xmlString: string): Record<string, any> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const descriptionElement = xmlDoc.getElementsByTagName(RDF_DESCRIPTION_ELEMENT)[0];

  if (!descriptionElement) return {};

  const metadata: Record<string, any> = {};
  Array.from(descriptionElement.children).forEach((child) => {
    metadata[child.nodeName] = child.textContent || '';
  });

  return metadata;
}

/**
 * Extrahiert spezifische Metadaten aus einem RDF/XML-Dokument.
 * @param xmlString - Der XML-String, der analysiert werden soll.
 * @param keys - Eine Liste von Metadaten-Schlüsseln, die extrahiert werden sollen.
 * @returns Ein Objekt mit den extrahierten Metadaten für die angegebenen Schlüssel.
 */
export function extractSpecificMetadata(
  xmlString: string,
  keys: string[]
): Record<string, any> {
  const allMetadata = parseMetadata(xmlString);
  return keys.reduce((result, key) => {
    if (allMetadata[key]) {
      result[key] = allMetadata[key];
    }
    return result;
  }, {} as Record<string, any>);
}
