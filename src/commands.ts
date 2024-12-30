// commands.ts
import { TableRow } from "@/types";

export default function createCopyRowCommand(
    getRows: () => TableRow[],
    getActiveRowId: () => number | null
) {
    return {
        id: 'copy-row',
        name: 'Copy Row to Clipboard',
        callback: () => {
            const rows = getRows();
            const rowId = getActiveRowId();
            
            console.log('Copy command executed with:', {
                rows: rows,
                activeRowId: rowId
            });

            if (rowId !== null) {
                const row = rows.find(r => r.id === rowId);
                if (row) {
                    // Bestimme den zu kopierenden Inhalt basierend auf der Kategorie
                    let contentToCopy = '';
                    
                    if (row.category === 'Keywords') {
                        // Für Keywords-Kategorie die Tags kopieren
                        contentToCopy = row.tags.join(', ');
                    } else {
                        // Für andere Kategorien den textContent verwenden
                        contentToCopy = row.textContent || '';
                    }

                    console.log(`Copying content: "${contentToCopy}"`);
                    
                    return navigator.clipboard.writeText(contentToCopy)
                        .then(() => {
                            console.log(`Row ${rowId} copied to clipboard: ${contentToCopy}`);
                            return true;
                        })
                        .catch(err => {
                            console.error('Fehler beim Kopieren in die Zwischenablage:', err);
                            return false;
                        });
                } else {
                    console.warn(`Row mit der ID ${rowId} wurde nicht gefunden.`);
                    return false;
                }
            } else {
                console.warn('Keine aktive Row ID verfügbar.');
                return false;
            }
        }
    };
}