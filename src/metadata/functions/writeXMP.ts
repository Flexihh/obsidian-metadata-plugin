/**
 * Funktionen zum Schreiben von XMP-Metadaten in Dateien
 */

import { serializeMetadata } from './serializeXMP';
import { isValidFileType } from '../utils/validators';
import * as fs from 'fs';

/**
 * Schreibt XMP-Metadaten in eine Datei.
 * @param filePath - Der Pfad zur Datei.
 * @param metadata - Die Metadaten als Schlüssel-Wert-Paare.
 * @throws Fehler, falls das Dateiformat nicht unterstützt wird oder das Schreiben fehlschlägt.
 */
export async function writeXMP(filePath: string, metadata: Record<string, any>): Promise<void> {
  const fileType = filePath.split('.').pop()?.toLowerCase();

  if (!fileType || !isValidFileType(fileType)) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const xmpData = serializeMetadata(metadata);
  const xmpPacket = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>\n${xmpData}\n<?xpacket end="w"?>`;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const updatedBuffer = Buffer.concat([fileBuffer, Buffer.from(xmpPacket)]);
    fs.writeFileSync(filePath, updatedBuffer);
  } catch (error) {
    throw new Error(`Failed to write XMP metadata: ${error.message}`);
  }
}
