/**
 * Zentrale Konstanten für das Metadata Manager Plugin
 */
import type {
  FileFormat,
  MetadataNamespace,
  FormatMetadataSupport,
  MetadataKeyMapping,
  MetadataSpecification,
  MetadataOriginalKey,
  FormatMetadataType
} from './types';

// 1. Basis-Definitionen
// ------------------------

// 1.1 Unterstützte Dateiformate
export const FILE_FORMATS = ['jpg', 'png', 'tiff'] as const;

// 1.2 Unterstützte Namespaces
export const METADATA_NAMESPACES: MetadataNamespace = {
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dc: 'http://purl.org/dc/elements/1.1/',
  xmp: 'http://ns.adobe.com/xap/1.0/',
  xmpMM: 'http://ns.adobe.com/xap/1.0/mm/',
  xmpRights: 'http://ns.adobe.com/xap/1.0/rights/',
  exif: 'http://ns.adobe.com/exif/1.0/',
  iptc: 'http://ns.adobe.com/iptc/1.0/',
  lr: 'http://ns.adobe.com/lightroom/1.0/'
} as const;

// 2. Format-spezifische Definitionen
// ---------------------------------

// 2.1 Definiere die unterstützten Metadaten pro Format
export const FORMAT_METADATA_SUPPORT: FormatMetadataSupport = {
  jpg: ['exif', 'iptc', 'xmp'] as FormatMetadataType[],
  png: ['xmp', 'textChunks'] as FormatMetadataType[],
  tiff: ['exif', 'iptc', 'xmp', 'geoTiff'] as FormatMetadataType[]
} as const;

// 3. Metadaten-Definitionen
// ------------------------

// 3.1 Basis-Metadaten-Mapping
export const METADATA_KEY_MAPPING: MetadataKeyMapping = {
  'dc:subject': 'subject',
  'dc:Description': 'description',
  'dc:Creator': 'author',
  'xmpMM:History': 'history',
  'lr:weightedFlatSubject': 'keywords',
  'lr:hierarchicalSubject': 'hierarchicalKeywords',
  'exif:Make': 'cameraMake',
  'exif:Model': 'cameraModel',
  'exif:LensModel': 'lensModel',
  'exif:DateTimeOriginal': 'dateTimeOriginal',
  'exif:ExposureTime': 'exposureTime',
  'exif:FNumber': 'aperture',
  'exif:ISO': 'iso',
  'exif:ShutterSpeedValue': 'shutterSpeed',
  'exif:FocalLength': 'focalLength',
  'exif:WhiteBalance': 'whiteBalance',
  'exif:SceneType': 'sceneType',
  'exif:ColorSpace': 'colorSpace',
  'exif:GPSLatitude': 'gpsLatitude',
  'exif:GPSLongitude': 'gpsLongitude',
  'xmp:CreatorTool': 'creatorTool',
  'xmp:MetadataDate': 'metadataDate',
  'xmp:Lens': 'lens',
  'xmp:DocumentID': 'documentId',
  'xmp:InstanceID': 'instanceId',
  'xmp:Title': 'title',
  'xmp:Description': 'xmpDescription',
  'xmp:CreateDate': 'createDate',
  'iptc:Keywords': 'iptcKeywords',
  'iptc:DateCreated': 'dateCreated',
  'iptc:TimeCreated': 'timeCreated',
  'iptc:Byline': 'byline',
  'iptc:CopyrightNotice': 'copyright',
  'xmpRights:Marked': 'rightsMarked',
  'xmpRights:WebStatement': 'rightsStatement'
} as const;

// 3.2 Alle verfügbaren Metadaten-Keys
export const METADATA_KEYS = Object.keys(METADATA_KEY_MAPPING) as MetadataOriginalKey[];

// 4. Format-spezifische Metadaten-Spezifikationen
// ---------------------------------------------

export const METADATA_SPECIFICATIONS: MetadataSpecification = {
  jpg: {
    exif: [
      'exif:DateTimeOriginal',
      'exif:Model',
      'exif:ExposureTime',
      'exif:ISO',
      'exif:GPSLatitude',
      'exif:GPSLongitude'
    ] as MetadataOriginalKey[],
    iptc: [
      'iptc:Keywords',
      'iptc:Byline',
      'iptc:CopyrightNotice'
    ] as MetadataOriginalKey[],
    xmp: [
      'xmp:Title',
      'xmp:Description',
      'xmp:CreateDate',
      'xmpRights:Marked',
      'xmpRights:WebStatement'
    ] as MetadataOriginalKey[]
  },
  png: {
    xmp: [
      'xmp:Title',
      'xmp:CreateDate',
      'xmp:Description'
    ] as MetadataOriginalKey[],
    textChunks: ['Author', 'Copyright']
  },
  tiff: {
    exif: [
      'exif:DateTimeOriginal',
      'exif:Model',
      'exif:ExposureTime',
      'exif:ISO',
      'exif:GPSLatitude',
      'exif:GPSLongitude'
    ] as MetadataOriginalKey[],
    iptc: [
      'iptc:Keywords',
      'iptc:Byline',
      'iptc:CopyrightNotice'
    ] as MetadataOriginalKey[],
    xmp: [
      'xmp:Title',
      'xmp:Description',
      'xmp:CreateDate',
      'xmpRights:Marked',
      'xmpRights:WebStatement'
    ] as MetadataOriginalKey[],
    geoTiff: ['GeoCoordinates', 'Projection']
  }
} as const;

// 5. RDF/XML Konstanten
// --------------------

export const RDF_ROOT_ELEMENT = 'rdf:RDF';
export const RDF_DESCRIPTION_ELEMENT = 'rdf:Description';

// Exportiere Namespaces für die XML-Verarbeitung
export const DEFAULT_XMLNS = METADATA_NAMESPACES;

// Exportiere Namespaces für Validierungen
export const VALID_NAMESPACES = Object.keys(METADATA_NAMESPACES) as (keyof MetadataNamespace)[];

// XML-Basis-Konfiguration
export const XML_CONFIG = {
  version: '1.0',
  encoding: 'UTF-8',
  standalone: true
} as const;

// XML Special Characters
export const XML_SPECIAL_CHARS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&apos;'
} as const;

// RDF-spezifische Konstanten
export const RDF_CONSTANTS = {
  NAMESPACE: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  BAG_ELEMENT: 'Bag',
  LIST_ITEM: 'li',
  ABOUT_ATTR: 'about',
  RESOURCE_ATTR: 'resource'
} as const;

// XML Validierungs-Nachrichten
export const XML_VALIDATION_MESSAGES = {
  INVALID_ROOT: 'Invalid root element',
  MISSING_DESCRIPTION: 'Missing RDF:Description element',
  MULTIPLE_DESCRIPTIONS: 'Multiple RDF:Description elements found',
  PARSE_ERROR: 'XML parsing error',
  INVALID_NAMESPACE: 'Invalid namespace declaration'
} as const;

export const XMP_MARKERS = {
  START: '<x:xmpmeta',
  END: '</x:xmpmeta>'
} as const;



export const VIEW_TYPE_METADATA = 'metadata-view';