  // metadataComponent.tsx

  import { useState, KeyboardEvent, useEffect, useRef } from 'react'
  import { App } from "obsidian"
  import { cn } from '@/lib/utils'
  import { TagBadge } from '@/components/tagBadge'
  import VaultAutosuggest from '@/components/VaultAutosuggest'
  import { TagFileConnectPopoverHandle } from '@/components/tagConnectPopoverComponent'
  import { Textarea } from '@/components/ui/textarea'
  import CategorySubmenu from './CategorySubmenu';
  import {
    Plus,
  } from 'lucide-react'
  import { EditDialog } from './edit-dialog'
  import { SearchDialog } from './search-dialog'
  import { CATEGORIES } from '../constants'
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
  import {
    convertMetadataValuesToCategoryRows,
    convertCategoryRowsToMetadataValues,
    DEFAULT_ADD_ROW
  } from '../utils/converters'
  import { TableRow, MetadataValues,Action,MetadataPlugin} from '../types' 

  interface MetadataProps {
    app: App;
    plugin: MetadataPlugin;  // Neu hinzugefügt
    metadata: MetadataValues;
    filePath: string;
    actions: Action[];
    onChange?: (values: MetadataValues) => void;
    onError?: (error: Error) => void;
}



  export function MetadataComponent({
    app,
    plugin,
    metadata,
    onChange,
    actions,
  }: MetadataProps) {
    const [rows, setRows] = useState<TableRow[]>(() => {
      const initialRows = convertMetadataValuesToCategoryRows(metadata, CATEGORIES);
      // Initialisiere die Rows im Plugin
      plugin.updateRows(initialRows);
      return initialRows;
  });

    const tagFileConnectRef = useRef<TagFileConnectPopoverHandle>(null);
  
    // Synchronisiere Rows mit dem Plugin wenn sie sich ändern
    useEffect(() => {
        console.log('Rows changed, updating plugin:', rows);
        plugin.updateRows(rows);
    }, [rows, plugin]);

    // Wenn sich die Rows ändern, informiere auch den Parent
    useEffect(() => {
        if (onChange) {
            const metadataValues = convertCategoryRowsToMetadataValues(rows, CATEGORIES);
            onChange(metadataValues);
        }
    }, [rows, onChange]);
  
    const handleCategorySelect = (categoryValue: string) => {
      const newId = Math.max(...rows.filter((row) => row.id !== 0).map((row) => row.id), 0) + 1;
      const selectedCategory = CATEGORIES.find((cat) => cat.value === categoryValue);
    
      setRows((prevRows) => [
        ...prevRows.filter((row) => row.id !== 0),
        {
          id: newId,
          category: selectedCategory?.label || '',
          tags: [],
          inputValue: '',
          textContent: '',
          isLocked: false, // Standardwert für neue Zeilen
        },
        DEFAULT_ADD_ROW
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
      setRows(rows.map((row) => {
        if (row.id === rowId && row.inputValue.trim()) {
          const newTag = row.inputValue.trim();
          return {
            ...row,
            tags: row.tags.includes(newTag) ? row.tags : [...row.tags, newTag], // Füge den Tag hinzu
            inputValue: '', // Leere das Eingabefeld
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


    const toggleLock = (rowId: number) => {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowId ? { ...row, isLocked: !row.isLocked } : row
        )
      );
      console.log(`Toggled row ${rowId}:`, rows);
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
                                <Plus className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-48" align="start">
                              {CATEGORIES.filter(
                                (category) => !usedCategories.includes(category.label)
                              ).map((category) => (
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
<CategorySubmenu
  app={app}
  plugin={plugin} 
  actions={actions}
  rowId={row.id}
  index={index}
  visibleRowsLength={visibleRows.length}
  onMoveUp={handleMoveUp}
  onMoveDown={handleMoveDown}
  onDuplicate={handleDuplicate}
  onDelete={handleDeleteRow}
  onSearch={openCategorySearch}
  isLocked={row.isLocked}
  category={row.category}
  onToggleLock={toggleLock}
/>                   )}
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
                          <div
                            key={tag}
                            className={`relative group ${
                              row.isLocked ? 'pointer-events-none' : ''
                            }`}
                          >
                            <TagBadge
                              key={tag}
                              app={app}
                              tag={tag}
                              onEdit={() => openEditDialog(tag)}
                              onRemove={() => removeTag(row.id, tag)}
                              onConnect={(value) => {
                                console.log(`Connected ${value} to ${tag}`);
                              }}
                            />
                          </div>
                        ))}
                        {!row.isLocked && (
                          <div className="flex-1 min-w-[180px] relative">
                            <VaultAutosuggest
                              app={app}
                              value={row.inputValue}
                              onSelect={(value) => value !== null && handleInputChange(row.id, value)}
                              onAddTag={(value) => {
                                handleInputChange(row.id, '');
                                if (!row.tags.includes(value)) {
                                  setRows((prevRows) =>
                                    prevRows.map((r) =>
                                      r.id === row.id
                                        ? { ...r, tags: [...r.tags, value], inputValue: '' }
                                        : r
                                    )
                                  );
                                }
                              }}
                              placeholder={
                                row.tags.length === 0 ? 'Tags eingeben...' : ''
                              }
                              className="h-8 px-2 border border-transparent rounded-md text-sm shadow-none hover:border-gray-300 focus:ring-2 focus:ring-gray-400"
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="group relative flex items-center w-full hover:border-gray-300 focus-within:border-gray-300 transition-all">
                        <Textarea
                          value={row.textContent}
                          onChange={(e) => handleTextContentChange(row.id, e.target.value)}
                          placeholder={
                            row.category
                              ? `${row.category} eingeben...`
                              : 'Erst Eigenschaft auswählen...'
                          }
                          className={cn(
                            'w-full resize-none bg-transparent text-sm px-2 py-1.5 outline-none',
                            'border-none shadow-none',
                            'focus:ring-2 focus:ring-gray-400 min-h-[28px]',
                            'placeholder:opacity-0 group-hover:placeholder:opacity-60 focus:placeholder:opacity-60 transition-opacity',
                            row.textContent
                              ? 'opacity-100'
                              : 'opacity-0 group-hover:opacity-60 focus:opacity-60'
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
    );
  }    