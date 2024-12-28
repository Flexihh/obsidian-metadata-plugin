/**
 * Funktionen zur Serialisierung von Metadaten in das RDF/XML-Format
 */

import { DEFAULT_XMLNS, RDF_ROOT_ELEMENT, RDF_DESCRIPTION_ELEMENT } from '../constants';

/**
 * Serialisiert Metadaten in das RDF/XML-Format.
 * @param metadata - Metadaten als Schlüssel-Wert-Paare.
 * @returns Ein XML-String, der die Metadaten im RDF/XML-Format repräsentiert.
 */
export function serializeMetadata(metadata: Record<string, any>): string {
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
 * Erzeugt ein leeres RDF/XML-Dokument.
 * @returns Ein XML-String mit den standardmäßigen Namespaces.
 */
export function createEmptyRDF(): string {
  const xmlnsAttributes = Object.entries(DEFAULT_XMLNS)
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join(' ');

  return `<${RDF_ROOT_ELEMENT} ${xmlnsAttributes}>
    <${RDF_DESCRIPTION_ELEMENT} />
  </${RDF_ROOT_ELEMENT}>`;
}
