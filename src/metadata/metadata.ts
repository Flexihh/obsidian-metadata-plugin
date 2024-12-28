/**
 * Einstiegspunkt für das Metadata Manager Plugin
 */

import { metadataCache } from './cache/metadataCache';
import { extractMetadata } from './functions/extractXMP';
import * as fs from 'fs';
import * as path from 'path';
import { FILE_FORMATS } from './constants';
import { FileType } from './types';

console.log('Metadata Manager Plugin initialized.');

// Vault-Verzeichnis definieren
const VAULT_DIR = path.join(__dirname, 'vault');

/**
 * Initialisiert den Cache mit allen unterstützten Dateien im Vault.
 */
export function initializeCache(): void {  // Funktion exportieren
  console.log('Initializing metadata cache...');
  const files = fs.readdirSync(VAULT_DIR);

  files.forEach((file) => {
    const filePath = path.join(VAULT_DIR, file);
    const fileType = file.split('.').pop()?.toLowerCase() as FileType;

    if (fileType && FILE_FORMATS.includes(fileType)) {
      try {
        const metadata = extractMetadata(filePath);
        metadataCache.set(filePath, {
          filePath,
          fileType,
          metadata,
          lastUpdated: new Date(),
        });
        console.log(`Cached metadata for ${file}`);
      } catch (error) {
        console.warn(`Failed to cache metadata for ${file}: ${error.message}`);
      }
    }
  });

  console.log('Metadata cache initialized.');
}

// Cache beim Start initialisieren
initializeCache();
