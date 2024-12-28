/**
 * Hilfsfunktionen für die XML-Verarbeitung im Metadata Manager Plugin
 */

import { DEFAULT_XMLNS, RDF_ROOT_ELEMENT, RDF_DESCRIPTION_ELEMENT } from '../constants';

/**
 * Erzeugt ein XML-Dokument mit den gegebenen Metadaten.
 * @param metadata - Die Metadaten als Schlüssel-Wert-Paar.
 * @returns Ein XML-String, der die Metadaten repräsentiert.
 */
export function createXML(metadata: Record<string, any>): string {
  const xmlnsAttributes = Object.entries(DEFAULT_XMLNS)
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join(' ');

  const metadataEntries = Object.entries(metadata)
    .map(([key, value]) => `<${key}>${value}</${key}>`)
    .join('');

  return `<${RDF_ROOT_ELEMENT} ${xmlnsAttributes}>
    <${RDF_DESCRIPTION_ELEMENT}>
      ${metadataEntries}
    </${RDF_DESCRIPTION_ELEMENT}>
  </${RDF_ROOT_ELEMENT}>`;
}

/**
 * Prüft, ob ein gegebener XML-String gültig ist.
 * @param xmlString - Der XML-String, der validiert werden soll.
 * @returns Boolean, ob der XML-String gültig ist.
 */
export function isValidXML(xmlString: string): boolean {
  try {
    new DOMParser().parseFromString(xmlString, 'application/xml');
    return true;
  } catch {
    return false;
  }
}

/**
 * Extrahiert Metadaten aus einem XML-String.
 * @param xmlString - Der XML-String, der analysiert werden soll.
 * @returns Ein Objekt, das die extrahierten Metadaten enthält.
 */
export function parseXML(xmlString: string): Record<string, any> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  const description = xmlDoc.getElementsByTagName(RDF_DESCRIPTION_ELEMENT)[0];

  if (!description) return {};

  const metadata: Record<string, any> = {};
  Array.from(description.children).forEach((node) => {
    metadata[node.nodeName] = node.textContent;
  });

  return metadata;
}
