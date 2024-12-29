// metadataComponent.tsx

import { useState, KeyboardEvent } from 'react'
import { App } from "obsidian";
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Pencil, Trash2, X, Search, Plus, ChevronUp, ChevronDown, Copy, HelpCircle, Hash, Puzzle, Wrench, ListChecks } from 'lucide-react'
import { EditDialog } from './edit-dialog'
import { SearchPopover } from './search-popover'
import { SearchDialog } from './search-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface StandardizedMetadata {
  subject: string[];
}

interface MetadataProps {
  app: App;
  metadata: {
    standardized: StandardizedMetadata;
  };
  filePath: string;
  onError: (error: Error) => void;
}


interface TableRow {
  id: number
  category: string
  tags: string[]
  inputValue: string
  textContent: string
  isDeleted?: boolean
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Keywords':
      return Hash;
    case 'Funktionen':
      return Puzzle;
    case 'Technologien':
      return Wrench;
    case 'Anforderungen':
      return ListChecks;
    default:
      return HelpCircle;
  }
};


// Props-Interface für Metadata-Komponente

interface MetadataProps {

  app: App; // Obsidian App-Instanz
  
  subjects: string[]; // Liste der Keywords oder Subjects
  
  }



const CATEGORIES = [
  { value: 'keywords', label: 'Keywords', icon: Hash },
  { value: 'features', label: 'Funktionen', icon: Puzzle },
  { value: 'tech', label: 'Technologien', icon: Wrench },
  { value: 'requirements', label: 'Anforderungen', icon: ListChecks }
]

export function MetadataComponent({ app, metadata, filePath, onError }: MetadataProps) {
  const subjects: string[] = Array.isArray(metadata.standardized.subject) ? metadata.standardized.subject : [];

  const [rows, setRows] = useState<TableRow[]>([
    {
      id: 1,
      category: 'Keywords',
      tags: subjects,
      inputValue: '',
      textContent: ''
    },
    { // Spezielle Add Row
      id: 0,
      category: '',
      tags: [],
      inputValue: '',
      textContent: ''
    }
  ]);

  const handleCategorySelect = (categoryValue: string) => {
    const newId = Math.max(...rows.filter(row => row.id !== 0).map(row => row.id), 0) + 1;
    setRows(prevRows => [
      ...prevRows.filter(row => row.id !== 0), // Entferne die alte Add Row
      {  // Füge die neue richtige Zeile hinzu
        id: newId,
        category: CATEGORIES.find(cat => cat.value === categoryValue)?.label || '',
        tags: [],
        inputValue: '',
        textContent: ''
      },
      {  // Füge die neue Add Row hinzu
        id: 0,
        category: '',
        tags: [],
        inputValue: '',
        textContent: ''
      }
    ]);
  };

  const handleMoveUp = (rowId: number) => {
    if (rowId === 0) return; // Ignoriere Add Row
    setRows(prevRows => {
      const filteredRows = prevRows.filter(row => row.id !== 0);
      const index = filteredRows.findIndex(row => row.id === rowId);
      if (index <= 0) return prevRows;
      
      const newRows = [...filteredRows];
      const temp = newRows[index];
      newRows[index] = newRows[index - 1];
      newRows[index - 1] = temp;
      
      return [...newRows, prevRows.find(row => row.id === 0)!];
    });
  };

  const handleMoveDown = (rowId: number) => {
    if (rowId === 0) return; // Ignoriere Add Row
    setRows(prevRows => {
      const filteredRows = prevRows.filter(row => row.id !== 0);
      const index = filteredRows.findIndex(row => row.id === rowId);
      if (index === -1 || index === filteredRows.length - 1) return prevRows;
      
      const newRows = [...filteredRows];
      const temp = newRows[index];
      newRows[index] = newRows[index + 1];
      newRows[index + 1] = temp;
      
      return [...newRows, prevRows.find(row => row.id === 0)!];
    });
  };

  const handleDuplicate = (rowId: number) => {
    if (rowId === 0) return; // Verhindere Duplizieren der Add Row
    const rowToDuplicate = rows.find(row => row.id === rowId);
    if (!rowToDuplicate) return;

    const newId = Math.max(...rows.filter(row => row.id !== 0).map(row => row.id), 0) + 1;
    const newRow = {
      ...rowToDuplicate,
      id: newId,
      tags: [...rowToDuplicate.tags]
    };

    setRows(prevRows => [
      ...prevRows.filter(row => row.id !== 0),
      newRow,
      prevRows.find(row => row.id === 0)!
    ]);
  };

  const handleDeleteRow = (rowId: number) => {
    if (rowId === 0) return; // Verhindere Löschen der Add Row
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, isDeleted: true } : row
    ));
  };

  const removeTag = (rowId: number, tagToRemove: string) => {
    if (rowId === 0) return; // Verhindere Tags für Add Row
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          tags: row.tags.filter(tag => tag !== tagToRemove)
        };
      }
      return row;
    }));
  };

  const handleInputChange = (rowId: number, value: string) => {
    if (rowId === 0) return; // Verhindere Input für Add Row
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, inputValue: value } : row
    ));
  };

  const handleTextContentChange = (rowId: number, value: string) => {
    if (rowId === 0) return; // Verhindere Text Input für Add Row
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, textContent: value } : row
    ));
  };

  const getAvailableCategories = (currentRowId: number) => {
    const usedCategories = rows
      .filter(row => row.id !== currentRowId && row.id !== 0 && !row.isDeleted)
      .map(row => row.category);
    return CATEGORIES.filter(category => !usedCategories.includes(category.label));
  };

  const handleCategoryChange = (rowId: number, value: string) => {
    if (rowId === 0) {
      handleCategorySelect(value);
      return;
    }
    setRows(rows.map(row =>
      row.id === rowId ? {
        ...row,
        category: CATEGORIES.find(cat => cat.value === value)?.label || value,
        tags: [],
        textContent: '',
        inputValue: ''
      } : row
    ));
  };

  const addTag = (rowId: number) => {
    if (rowId === 0) return; // Verhindere Tags für Add Row
    setRows(rows.map(row => {
      if (row.id === rowId && row.inputValue.trim()) {
        const newTag = row.inputValue.trim();
        return {
          ...row,
          tags: row.tags.includes(newTag) ? row.tags : [...row.tags, newTag],
          inputValue: ''
        };
      }
      return row;
    }));
  };

  const handleKeyPress = (rowId: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTag(rowId);
    }
  };

  // Zustandsmanagement für Dialoge
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  const [categorySearchOpen, setCategorySearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const openEditDialog = (tag: string) => {
    setSelectedTag(tag);
    setEditDialogOpen(true);
  };

  const openCategorySearch = (category: string) => {
    setSelectedCategory(category);
    setCategorySearchOpen(true);
  };

  const handleTagUpdate = (oldTag: string, newTag: string) => {
    setRows(rows.map(row => ({
      ...row,
      tags: row.tags.map(tag => tag === oldTag ? newTag : tag)
    })));
  };

  // Angepasste Filterlogik
  const normalRows = rows.filter(row => row.id !== 0 && !row.isDeleted);
  const hasUnselectedCategory = normalRows.some(row => row.category === '');
  const usedCategories = normalRows.map(row => row.category);
  const noAvailableCategories = CATEGORIES.every(cat => usedCategories.includes(cat.label));
  
  // Sichtbare Zeilen mit bedingter Add Row
  const visibleRows = [
    ...normalRows,
    ...(!hasUnselectedCategory && !noAvailableCategories ? [rows.find(row => row.id === 0)!] : [])
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6 overflow-hidden">
      <h1 className="text-xl text-gray-900">Metadaten</h1>
  
      <div className="space-y-4">
        <div className="space-y-1">
          {visibleRows.map((row, index) => {
            const availableCategories = getAvailableCategories(row.id);
            const isKeywords = row.category === 'Keywords';
            const isNewRow = row.category === '';
            const CategoryIcon = isNewRow ? Plus : getCategoryIcon(row.category);
  
            return (
              <div
                key={row.id}
                className="group flex items-start gap-6 py-1.5 rounded-sm transition-all"
              >
                <div className="w-[120px] flex-shrink-0">
                  <div className="flex items-start gap-2">
                    <div className="w-8 flex justify-center pt-1.5">
                      {isNewRow ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="p-1 cursor-pointer rounded hover:bg-gray-100 transition-colors">
                              <CategoryIcon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48" align="start">
                            {CATEGORIES.filter(category => !usedCategories.includes(category.label)).map((category) => (
                              <DropdownMenuItem
                                key={category.value}
                                onClick={() => handleCategorySelect(category.value)}
                                className="text-sm py-1.5"
                              >
                                {category.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <div className="p-1 cursor-pointer rounded hover:bg-gray-100 transition-colors">
                              <CategoryIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-48" align="start">
                            <DropdownMenuItem
                              onClick={() => handleMoveUp(row.id)}
                              disabled={index === 0}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <ChevronUp className="h-3.5 w-3.5" />
                              <span className="text-sm">Nach oben</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleMoveDown(row.id)}
                              disabled={index === visibleRows.length - 1}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <ChevronDown className="h-3.5 w-3.5" />
                              <span className="text-sm">Nach unten</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openCategorySearch(row.category)}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <Search className="h-3.5 w-3.5" />
                              <span className="text-sm">Suchen</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDuplicate(row.id)}
                              className="flex items-center gap-2 py-1.5"
                            >
                              <Copy className="h-3.5 w-3.5" />
                              <span className="text-sm">Duplizieren</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteRow(row.id)}
                              className="flex items-center gap-2 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              <span className="text-sm">Löschen</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <span className="text-sm text-gray-600 pt-1.5 text-left">
                      {isNewRow ? 'Kategorie' : row.category}
                    </span>
                  </div>
                </div>
  
                <div className="flex-1 min-w-0 ml-2">
                  {isKeywords ? (
                    <div className="flex flex-wrap items-start gap-2 pt-1.5">
                      {row.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="group/badge px-2.5 py-0.5 bg-white hover:bg-gray-100 rounded-full text-sm font-normal text-gray-700 border-gray-200 transition-all flex items-center justify-between"
                        >
                          <span>{tag}</span>
                          <div className="w-0 group-hover/badge:w-[42px] overflow-hidden transition-all duration-200">
                            <div className="flex items-center justify-end gap-1 ml-0.5">
                              <Pencil
                                className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500 cursor-pointer shrink-0 transition-colors"
                                onClick={() => openEditDialog(tag)}
                              />
                              <X
                                className="h-3.5 w-3.5 text-gray-400 hover:text-red-500 cursor-pointer shrink-0 transition-colors"
                                onClick={() => removeTag(row.id, tag)}
                              />
                            </div>
                          </div>
                        </Badge>
                      ))}
                      <div className="flex-1 min-w-[180px] relative">
                        <Input
                          value={row.inputValue}
                          onChange={(e) => handleInputChange(row.id, e.target.value)}
                          onKeyPress={(e) => handleKeyPress(row.id, e)}
                          placeholder={row.tags.length === 0 ? "Tags eingeben..." : ""}
                          className="h-8 px-2 pl-6 border border-transparent rounded-md text-sm shadow-none hover:border-gray-300 focus:ring-2 focus:ring-gray-400"
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          <SearchPopover
                            category={row.category}
                            onSearch={(term) => {
                              console.log(`Quick search for ${term} in ${row.category}`);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="group relative flex items-center w-full hover:border-gray-300 focus-within:border-gray-300 transition-all">
                      <Textarea
                        value={row.textContent}
                        onChange={(e) => handleTextContentChange(row.id, e.target.value)}
                        placeholder={
                          row.category
                            ? `${row.category} eingeben...`
                            : "Erst Eigenschaft auswählen..."
                        }
                        className={cn(
                          "w-full resize-none bg-transparent text-sm px-2 py-1.5 outline-none",
                          "border-none shadow-none",
                          "focus:ring-2 focus:ring-gray-400 min-h-[28px]",
                          "placeholder:opacity-0 group-hover:placeholder:opacity-60 focus:placeholder:opacity-60 transition-opacity",
                          row.textContent ? "opacity-100" : "opacity-0 group-hover:opacity-60 focus:opacity-60"
                        )}
                        disabled={!row.category}
                        rows={1}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
  
      <EditDialog
        tag={selectedTag}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onTagUpdate={handleTagUpdate}
      />
  
      <SearchDialog
        tag={selectedCategory}
        open={categorySearchOpen}
        onOpenChange={setCategorySearchOpen}
      />
    </div>
  )
}