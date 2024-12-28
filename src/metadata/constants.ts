/**
 * Zentrale Konstanten für das Metadata Manager Plugin
 */

// Unterstützte Dateiformate
export const FILE_FORMATS = ['jpg', 'png', 'tiff'];

// Metadaten-Typen
export const METADATA_KEYS = [
  'dc:subject',
  'xmpMM:History',
  'lr:weightedFlatSubject',
  'lr:hierarchicalSubject',
  // Weitere bekannte Schlüssel hinzufügen
];

// RDF/XML relevante Konstanten
export const RDF_ROOT_ELEMENT = 'rdf:RDF';
export const RDF_DESCRIPTION_ELEMENT = 'rdf:Description';
export const DEFAULT_XMLNS = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dc: 'http://purl.org/dc/elements/1.1/',
};

// Metadaten-Spezifikationen
export const METADATA_SPECIFICATIONS = {
  jpg: {
    exif: [
      'exif:DateTimeOriginal',
      'exif:Model',
      'exif:ExposureTime',
      'exif:ISO',
      'exif:GPSLatitude',
      'exif:GPSLongitude',
    ],
    iptc: ['iptc:Keywords', 'iptc:Byline', 'iptc:CopyrightNotice'],
    xmp: [
      'xmp:Title',
      'xmp:Description',
      'xmp:CreateDate',
      'xmpRights:Marked',
      'xmpRights:WebStatement',
    ],
  },
  png: {
    xmp: ['xmp:Title', 'xmp:CreateDate', 'xmp:Description'],
    textChunks: ['Author', 'Copyright'],
  },
  tiff: {
    exif: [
      'exif:DateTimeOriginal',
      'exif:Model',
      'exif:ExposureTime',
      'exif:ISO',
      'exif:GPSLatitude',
      'exif:GPSLongitude',
    ],
    iptc: ['iptc:Keywords', 'iptc:Byline', 'iptc:CopyrightNotice'],
    xmp: [
      'xmp:Title',
      'xmp:Description',
      'xmp:CreateDate',
      'xmpRights:Marked',
      'xmpRights:WebStatement',
    ],
    geoTiff: ['GeoCoordinates', 'Projection'],
  },
};

// Besonderheiten bei den Formaten
export const FORMAT_NOTES = {
  jpg: [
    'Metadaten werden oft von Kameras oder Bildbearbeitungsprogrammen wie Photoshop hinzugefügt.',
    'Manche Programme entfernen Metadaten, um Speicherplatz zu sparen.',
  ],
  png: [
    'PNG ist eher für Web- und Grafikdateien optimiert, daher werden oft weniger Metadaten eingebettet.',
    'Nicht alle Programme unterstützen das Speichern von Metadaten in PNG.',
  ],
  tiff: [
    'TIFF ist ein professionelles Format, das umfangreiche Metadaten unterstützt.',
    'Wird oft für Druck und Archivierung verwendet, daher finden sich hier vollständige und strukturierte Metadaten.',
  ],
};
