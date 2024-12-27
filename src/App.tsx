'use client';

import { useState, useEffect, KeyboardEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

// Default-Kategorien für die Select-Auswahl
const DEFAULT_CATEGORIES = [
  { value: 'keywords', label: 'Keywords' },
  { value: 'functions', label: 'Funktionen' },
  { value: 'classes', label: 'Klassen' },
] as const;

// Interface für Tabellenzeilen
interface TableRow {
  id: number;
  category: string;
  tags: string[];
  inputValue: string;
}

export function App(container: Record<string, any>) {
  // Logge den Inhalt des Containers für Debugging
  console.log('%cContainer Inhalt:', 'color: blue; font-weight: bold;', JSON.stringify(container, null, 2));

  // Zustand für Tabellenzeilen
  const [rows, setRows] = useState<TableRow[]>([
    {
      id: 1,
      category: DEFAULT_CATEGORIES[1].label,
      tags: ['techSpec', 'ddd', 'dd', 'Test'],
      inputValue: '',
    },
  ]);

  // Überprüfung des Containers nach dem Rendern
  useEffect(() => {
    const mainElement = document.querySelector('main[class="@container"]');
    if (mainElement) {
      console.log('%c<main> element with @container class exists:', 'color: green; font-weight: bold;', mainElement);
    } else {
      console.log('%c<main> element with @container class not found.', 'color: red; font-weight: bold;');
    }
  }, []);

  // Funktion zum Hinzufügen einer neuen Zeile
  const addNewRow = () => {
    const newId = Math.max(...rows.map((row) => row.id), 0) + 1;
    setRows([
      ...rows,
      {
        id: newId,
        category: DEFAULT_CATEGORIES[0].label,
        tags: [],
        inputValue: '',
      },
    ]);
  };

  // Funktion zum Entfernen eines Tags aus einer Zeile
  const removeTag = (rowId: number, tagToRemove: string) => {
    setRows(
      rows.map((row) =>
        row.id === rowId ? { ...row, tags: row.tags.filter((tag) => tag !== tagToRemove) } : row
      )
    );
  };

  // Aktualisierung des Input-Werts einer Zeile
  const handleInputChange = (rowId: number, value: string) => {
    setRows(rows.map((row) => (row.id === rowId ? { ...row, inputValue: value } : row)));
  };

  // Aktualisierung der Kategorie einer Zeile
  const handleCategoryChange = (rowId: number, value: string) => {
    setRows(
      rows.map((row) =>
        row.id === rowId
          ? { ...row, category: DEFAULT_CATEGORIES.find((cat) => cat.value === value)?.label || value }
          : row
      )
    );
  };

  // Hinzufügen eines Tags zu einer Zeile
  const addTag = (rowId: number) => {
    setRows(
      rows.map((row) => {
        if (row.id === rowId && row.inputValue.trim()) {
          const newTag = row.inputValue.trim();
          return {
            ...row,
            tags: row.tags.includes(newTag) ? row.tags : [...row.tags, newTag],
            inputValue: '',
          };
        }
        return row;
      })
    );
  };

  // Verarbeiten der Enter-Taste im Input
  const handleKeyPress = (rowId: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTag(rowId);
    }
  };

  return (
    <main className="@container">
      <Card>
        <CardHeader>
          <CardTitle>Eigenschaften</CardTitle>
        </CardHeader>
        <CardContent>
          {rows.map((row) => (
            <Card key={row.id}>
              <CardContent>
                {/* Kategorie-Auswahl */}
                <Select
                  defaultValue={DEFAULT_CATEGORIES.find((cat) => cat.label === row.category)?.value || 'keywords'}
                  onValueChange={(value) => handleCategoryChange(row.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tags und Eingabefeld */}
                <div>
                  {row.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                      <Button
                        onClick={() => removeTag(row.id, tag)}
                        variant="ghost"
                        size="sm"
                      >
                        <X />
                        <span className="sr-only">Remove {tag} tag</span>
                      </Button>
                    </Badge>
                  ))}
                  <Input
                    value={row.inputValue}
                    onChange={(e) => handleInputChange(row.id, e.target.value)}
                    onKeyPress={(e) => handleKeyPress(row.id, e)}
                    placeholder="Tags eingeben..."
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Button zum Hinzufügen einer neuen Zeile */}
          <Button onClick={addNewRow} variant="outline">
            + Eigenschaft hinzufügen
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
