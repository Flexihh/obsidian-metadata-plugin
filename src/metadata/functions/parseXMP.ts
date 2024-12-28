import { validateMetadata } from '../utils/validators';

/**
 * Parst ein RDF/XML-Dokument und extrahiert die Metadaten.
 * Unterstützt auch <rdf:Bag> für Listenstrukturen.
 * @param xmlString - Der XML-String, der analysiert werden soll.
 * @returns Ein Objekt mit den extrahierten Metadaten.
 * @throws Fehler bei ungültigen RDF/XML-Daten.
 */
export function parseMetadata(xmlString: string): Record<string, any> {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');

  // Prüfen auf Parsing-Fehler
  const error = xmlDoc.querySelector('parsererror');
  if (error) {
    throw new Error('Ungültige RDF/XML-Daten: ' + error.textContent);
  }

  const descriptionElement = xmlDoc.getElementsByTagName('rdf:Description')[0];
  if (!descriptionElement) {
    console.warn('No RDF description element found in XML.');
    return {};
  }

  const metadata: Record<string, any> = {};
  Array.from(descriptionElement.children).forEach((child) => {
    const tagName = child.tagName;
    const textContent = child.textContent?.trim() || '';

    // Verarbeitung von <rdf:Bag>
    const bag = child.getElementsByTagNameNS(
      'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
      'Bag'
    )[0];
    if (bag) {
      const liElements = bag.getElementsByTagName('rdf:li');
      const keywords = Array.from(liElements)
        .map((li) => li.textContent?.trim() || '')
        .filter((kw) => kw);

      metadata[tagName] = keywords.length > 1 ? keywords : keywords[0];
      return;
    }

    // Einzelne Werte oder Arrays speichern
    if (metadata[tagName]) {
      if (Array.isArray(metadata[tagName])) {
        (metadata[tagName] as string[]).push(textContent);
      } else {
        metadata[tagName] = [metadata[tagName] as string, textContent];
      }
    } else {
      metadata[tagName] = textContent;
    }
  });

  // Validierung der extrahierten Metadaten
  if (!validateMetadata(metadata)) {
    throw new Error('Validation failed: Extracted metadata is invalid.');
  }

  console.info('Parsed metadata:', metadata);
  return metadata;
}
