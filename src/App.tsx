import { useState, KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2, X, Search, Plus, ChevronUp, ChevronDown, Copy, Tag, Hash, Puzzle, Wrench, ListChecks } from 'lucide-react'
import { EditDialog } from './components/edit-dialog'
import { SearchPopover } from './components/search-popover'
import { SearchDialog } from './components/search-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
      return Tag;
  }
};

const CATEGORIES = [
  { value: 'keywords', label: 'Keywords', icon: Hash },
  { value: 'features', label: 'Funktionen', icon: Puzzle },
  { value: 'tech', label: 'Technologien', icon: Wrench },
  { value: 'requirements', label: 'Anforderungen', icon: ListChecks }
]

export function App() {
  const [rows, setRows] = useState<TableRow[]>([
    {
      id: 1,
      category: 'Keywords',
      tags: ['techSpec', 'ddd', 'dd', 'Test'],
      inputValue: '',
      textContent: ''
    }
  ])

  const addNewRow = () => {
    const newId = Math.max(...rows.map(row => row.id), 0) + 1
    setRows([...rows, {
      id: newId,
      category: '',
      tags: [],
      inputValue: '',
      textContent: ''
    }])
  }

  const handleMoveUp = (rowId: number) => {
    setRows(prevRows => {
      const index = prevRows.findIndex(row => row.id === rowId)
      if (index <= 0) return prevRows
      
      const newRows = [...prevRows]
      const temp = newRows[index]
      newRows[index] = newRows[index - 1]
      newRows[index - 1] = temp
      
      return newRows
    })
  }

  const handleMoveDown = (rowId: number) => {
    setRows(prevRows => {
      const index = prevRows.findIndex(row => row.id === rowId)
      if (index === -1 || index === prevRows.length - 1) return prevRows
      
      const newRows = [...prevRows]
      const temp = newRows[index]
      newRows[index] = newRows[index + 1]
      newRows[index + 1] = temp
      
      return newRows
    })
  }

  const handleDuplicate = (rowId: number) => {
    const rowToDuplicate = rows.find(row => row.id === rowId)
    if (!rowToDuplicate) return

    const newId = Math.max(...rows.map(row => row.id), 0) + 1
    const newRow = {
      ...rowToDuplicate,
      id: newId,
      tags: [...rowToDuplicate.tags]
    }

    setRows([...rows, newRow])
  }

  const removeTag = (rowId: number, tagToRemove: string) => {
    setRows(rows.map(row => {
      if (row.id === rowId) {
        return {
          ...row,
          tags: row.tags.filter(tag => tag !== tagToRemove)
        }
      }
      return row
    }))
  }

  const handleInputChange = (rowId: number, value: string) => {
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, inputValue: value } : row
    ))
  }

  const handleTextContentChange = (rowId: number, value: string) => {
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, textContent: value } : row
    ))
  }

  const getAvailableCategories = (currentRowId: number) => {
    const usedCategories = rows
      .filter(row => row.id !== currentRowId && !row.isDeleted)
      .map(row => row.category)
    return CATEGORIES.filter(category => !usedCategories.includes(category.label))
  }

  const handleCategoryChange = (rowId: number, value: string) => {
    setRows(rows.map(row =>
      row.id === rowId ? {
        ...row,
        category: CATEGORIES.find(cat => cat.value === value)?.label || value,
        tags: [],
        textContent: '',
        inputValue: ''
      } : row
    ))
  }

  const handleDeleteRow = (rowId: number) => {
    setRows(rows.map(row =>
      row.id === rowId ? { ...row, isDeleted: true } : row
    ))
  }

  const addTag = (rowId: number) => {
    setRows(rows.map(row => {
      if (row.id === rowId && row.inputValue.trim()) {
        const newTag = row.inputValue.trim()
        return {
          ...row,
          tags: row.tags.includes(newTag) ? row.tags : [...row.tags, newTag],
          inputValue: ''
        }
      }
      return row
    }))
  }

  const handleKeyPress = (rowId: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addTag(rowId)
    }
  }

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState('')

  const openEditDialog = (tag: string) => {
    setSelectedTag(tag)
    setEditDialogOpen(true)
  }

  const handleTagUpdate = (oldTag: string, newTag: string) => {
    setRows(rows.map(row => ({
      ...row,
      tags: row.tags.map(tag => tag === oldTag ? newTag : tag)
    })))
  }

  const visibleRows = rows.filter(row => !row.isDeleted)

  const [categorySearchOpen, setCategorySearchOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('')

  const openCategorySearch = (category: string) => {
    setSelectedCategory(category)
    setCategorySearchOpen(true)
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-6">
      <h1 className="text-xl text-gray-900">Metadaten</h1>
  
      <div className="space-y-4">
        <span
          onClick={addNewRow}
          className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-900 cursor-pointer text-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Eigenschaft hinzufügen</span>
        </span>
  
        <div className="space-y-1">
          {visibleRows.map((row, index) => {
            const availableCategories = getAvailableCategories(row.id)
            const isKeywords = row.category === 'Keywords'
            const isNewRow = row.category === ''
            const CategoryIcon = getCategoryIcon(row.category)
  
            return (
              <div 
                key={row.id} 
                className="group flex items-start gap-3 py-1.5 hover:bg-gray-50/50 rounded-sm transition-colors"
              >
                {!isNewRow && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div className="p-1 cursor-pointer rounded hover:bg-gray-100 transition-colors">
                        <CategoryIcon className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
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
  
                <div className="w-[120px] flex-shrink-0">
                  {isNewRow ? (
                    <Select
                      value={row.category || undefined}
                      onValueChange={(value) => handleCategoryChange(row.id, value)}
                    >
                      <SelectTrigger className="h-6 border-0 hover:bg-gray-100 text-sm px-2 shadow-none">
                        <SelectValue placeholder="Auswählen..." />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((category) => {
                          const Icon = category.icon
                          return (
                            <SelectItem 
                              key={category.value} 
                              value={category.value}
                              className="text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <Icon className="h-3.5 w-3.5 text-gray-500" />
                                <span>{category.label}</span>
                              </div>
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  ) : (
                    <span className="text-sm text-gray-600 px-2">{row.category}</span>
                  )}
                </div>
  
                <div className="flex-1 min-w-0">
                  {isKeywords ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {row.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-2.5 py-0.5 bg-gray-100 hover:bg-gray-200 border-0 rounded-full text-sm font-normal text-gray-700"
                        >
                          {tag}
                          <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Pencil 
                              className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-pointer" 
                              onClick={() => openEditDialog(tag)}
                            />
                            <X 
                              className="h-3 w-3 text-gray-400 hover:text-gray-600 cursor-pointer" 
                              onClick={() => removeTag(row.id, tag)}
                            />
                          </div>
                        </Badge>
                      ))}
                      <div className="flex-1 min-w-[180px] relative">
                        <Input
                          value={row.inputValue}
                          onChange={(e) => handleInputChange(row.id, e.target.value)}
                          onKeyPress={(e) => handleKeyPress(row.id, e)}
                          placeholder={row.tags.length === 0 ? "Tags eingeben..." : ""}
                          className="h-6 px-2 pl-6 border-0 shadow-none text-sm hover:bg-gray-100 transition-colors"
                        />
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                          <SearchPopover 
                            category={row.category}
                            onSearch={(term) => {
                              console.log(`Quick search for ${term} in ${row.category}`)
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Textarea
                      value={row.textContent}
                      onChange={(e) => handleTextContentChange(row.id, e.target.value)}
                      placeholder={row.category ? `${row.category} eingeben...` : "Erst Eigenschaft auswählen..."}
                      className={cn(
                        "resize-none border-0 hover:bg-gray-100 shadow-none text-sm px-2 py-1",
                        row.category === 'Funktionen' || row.category === 'Anforderungen' 
                          ? "min-h-[28px] overflow-hidden" 
                          : "min-h-[100px]"
                      )}
                      disabled={!row.category}
                      rows={1}
                      onInput={(e) => {
                        const target = e.target as HTMLTextAreaElement;
                        if (row.category === 'Funktionen' || row.category === 'Anforderungen') {
                          target.style.height = 'auto';
                          target.style.height = target.scrollHeight + 'px';
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )
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
