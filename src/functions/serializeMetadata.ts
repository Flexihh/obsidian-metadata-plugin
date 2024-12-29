/**
 * Funktionen zur Serialisierung von Metadaten in das RDF/XML-Format
 */
import { 
  DEFAULT_XMLNS, 
  RDF_ROOT_ELEMENT, 
  RDF_DESCRIPTION_ELEMENT,
  XML_CONFIG,
  RDF_CONSTANTS
} from '../constants';
import type { 
  MetadataOriginalKey, 
  MetadataStandardKey,
  RDFValue
} from '../types';

type MetadataRecord = Partial<Record<MetadataOriginalKey | MetadataStandardKey, RDFValue>>;

/**
 * Erstellt die XML Namespace Attribute.
 */
function createXmlnsAttributes(): string {
  return Object.entries(DEFAULT_XMLNS)
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join('\n    ');
}

/**
 * Serialisiert einen einzelnen Metadaten-Wert.
 */
function serializeValue(value: RDFValue): string {
  if (Array.isArray(value)) {
    const items = value
      .map(item => `      <${RDF_CONSTANTS.LIST_ITEM}>${String(item)}</${RDF_CONSTANTS.LIST_ITEM}>`)
      .join('\n');
    return `\n    <${RDF_CONSTANTS.BAG_ELEMENT}>\n${items}\n    </${RDF_CONSTANTS.BAG_ELEMENT}>\n  `;
  }
  
  return String(value ?? '');
}

/**
 * Serialisiert Metadaten in das RDF/XML-Format.
 * @param metadata - Metadaten als Schlüssel-Wert-Paare.
 * @returns Ein XML-String, der die Metadaten im RDF/XML-Format repräsentiert.
 */
export function serializeMetadata(metadata: MetadataRecord): string {
  const xmlnsAttributes = createXmlnsAttributes();
  
  const metadataEntries = Object.entries(metadata)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      const serializedValue = serializeValue(value);
      return `    <${key}>${serializedValue}</${key}>`;
    })
    .join('\n');

  return `<?xml version="${XML_CONFIG.version}" encoding="${XML_CONFIG.encoding}"?>
<${RDF_ROOT_ELEMENT}
    ${xmlnsAttributes}>
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
  const xmlnsAttributes = createXmlnsAttributes();
  
  return `<?xml version="${XML_CONFIG.version}" encoding="${XML_CONFIG.encoding}"?>
<${RDF_ROOT_ELEMENT}
    ${xmlnsAttributes}>
  <${RDF_DESCRIPTION_ELEMENT} />
</${RDF_ROOT_ELEMENT}>`;
}