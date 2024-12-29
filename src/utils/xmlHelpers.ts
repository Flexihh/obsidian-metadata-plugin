/**
 * Hilfsfunktionen für die XML-Verarbeitung im Metadata Manager Plugin
 */
import { 
  DEFAULT_XMLNS, 
  RDF_ROOT_ELEMENT, 
  RDF_DESCRIPTION_ELEMENT,
  XML_CONFIG,
  XML_SPECIAL_CHARS,
  RDF_CONSTANTS,
  XML_VALIDATION_MESSAGES
} from '../constants';
import type { 
  MetadataOriginalKey, 
  MetadataStandardKey,
  XMLContent,
  RDFBagContent,
  XMLValidationResult
} from '../types';

type MetadataRecord = Partial<Record<MetadataOriginalKey | MetadataStandardKey, unknown>>;

/**
 * Escaped XML-Sonderzeichen.
 */
function escapeXml(unsafe: string): string {
  return unsafe.replace(/[&<>"']/g, char => XML_SPECIAL_CHARS[char as keyof typeof XML_SPECIAL_CHARS]);
}

/**
 * Erstellt ein RDF Bag Element.
 */
function createRDFBag(content: RDFBagContent): string {
  const items = content.items.map(item => 
    `        <${RDF_CONSTANTS.LIST_ITEM}>${escapeXml(item)}</${RDF_CONSTANTS.LIST_ITEM}>`
  ).join('\n');

  return `<${RDF_CONSTANTS.BAG_ELEMENT}>
${items}
      </${RDF_CONSTANTS.BAG_ELEMENT}>`;
}

/**
 * Erstellt ein XML-Element.
 */
function createXMLElement(content: XMLContent): string {
  const attributes = content.attributes 
    ? ' ' + Object.entries(content.attributes)
        .map(([key, value]) => `${key}="${escapeXml(value)}"`)
        .join(' ')
    : '';

  if (typeof content.value === 'object' && content.value !== null) {
    return `<${content.name}${attributes}>
      ${createRDFBag(content.value)}
    </${content.name}>`;
  }

  return `<${content.name}${attributes}>${escapeXml(String(content.value))}</${content.name}>`;
}

/**
 * Erzeugt ein RDF/XML-Dokument mit den gegebenen Metadaten.
 */
export function createXML(metadata: MetadataRecord): string {
  const xmlnsAttributes = Object.entries(DEFAULT_XMLNS)
    .map(([prefix, uri]) => `xmlns:${prefix}="${uri}"`)
    .join('\n    ');

  const metadataEntries = Object.entries(metadata)
    .map(([key, value]) => {
      if (value === null || value === undefined) return '';

      const xmlContent: XMLContent = {
        name: key,
        value: Array.isArray(value) 
          ? { items: value.map(String) }
          : String(value)
      };

      return createXMLElement(xmlContent);
    })
    .filter(Boolean)
    .join('\n    ');

  return `<?xml version="${XML_CONFIG.version}" encoding="${XML_CONFIG.encoding}"?>
<${RDF_ROOT_ELEMENT}
    ${xmlnsAttributes}>
  <${RDF_DESCRIPTION_ELEMENT}>
    ${metadataEntries}
  </${RDF_DESCRIPTION_ELEMENT}>
</${RDF_ROOT_ELEMENT}>`;
}

/**
 * Prüft, ob ein XML-String gültig ist.
 */
export function validateXML(xmlString: string): XMLValidationResult {
  const errors: string[] = [];

  try {
    const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
    
    const errorNode = doc.querySelector('parsererror');
    if (errorNode) {
      errors.push(`${XML_VALIDATION_MESSAGES.PARSE_ERROR}: ${errorNode.textContent}`);
      return { isValid: false, errors };
    }

    const root = doc.documentElement;
    if (root.nodeName !== RDF_ROOT_ELEMENT) {
      errors.push(`${XML_VALIDATION_MESSAGES.INVALID_ROOT}: ${root.nodeName}`);
    }

    const descriptions = root.getElementsByTagName(RDF_DESCRIPTION_ELEMENT);
    if (descriptions.length === 0) {
      errors.push(XML_VALIDATION_MESSAGES.MISSING_DESCRIPTION);
    } else if (descriptions.length > 1) {
      errors.push(XML_VALIDATION_MESSAGES.MULTIPLE_DESCRIPTIONS);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  } catch (error) {
    errors.push(`${XML_VALIDATION_MESSAGES.PARSE_ERROR}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }
}

/**
 * Extrahiert Metadaten aus einem XML-String.
 */
export function parseXML(xmlString: string): MetadataRecord {
  const validation = validateXML(xmlString);
  if (!validation.isValid) {
    console.warn('XML validation failed:', validation.errors);
    return {};
  }

  const doc = new DOMParser().parseFromString(xmlString, 'application/xml');
  const description = doc.getElementsByTagName(RDF_DESCRIPTION_ELEMENT)[0];
  const metadata: MetadataRecord = {};

  Array.from(description.children).forEach((node) => {
    const key = node.nodeName as MetadataOriginalKey | MetadataStandardKey;
    
    const rdfBag = node.getElementsByTagNameNS(RDF_CONSTANTS.NAMESPACE, RDF_CONSTANTS.BAG_ELEMENT)[0];

    if (rdfBag) {
      const items = Array.from(rdfBag.getElementsByTagNameNS(RDF_CONSTANTS.NAMESPACE, RDF_CONSTANTS.LIST_ITEM))
        .map(item => item.textContent?.trim())
        .filter((item): item is string => item !== undefined && item !== '');
      
      metadata[key] = items;
    } else {
      metadata[key] = node.textContent?.trim() || '';
    }
  });

  return metadata;
}