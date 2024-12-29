import { isValidFileType } from '../utils/validators';

/**
 * Extrahiert und validiert den Dateityp (Erweiterung) aus einem Dateipfad.
 * @param filePath - Der Pfad zur Datei.
 * @returns Der gültige Dateityp (z. B. 'jpg', 'png') oder `null`, wenn der Typ ungültig oder nicht unterstützt ist.
 */
export function getFileTypeFromPath(filePath: string): string | null {
    try {
        // Extrahiert die Dateiendung
        const fileType = filePath.split('.').pop()?.toLowerCase();

        // Validiert den Dateityp
        if (fileType && isValidFileType(fileType)) {
            return fileType;
        }

        console.warn('Ungültiger oder nicht unterstützter Dateityp:', filePath);
        return null;
    } catch (error) {
        console.error(`Fehler beim Extrahieren oder Validieren des Dateityps: "${filePath}"`, error);
        return null;
    }
}
