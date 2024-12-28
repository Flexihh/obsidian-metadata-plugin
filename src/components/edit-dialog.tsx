'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Tag } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

interface EditDialogProps {
  tag: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onTagUpdate: (oldTag: string, newTag: string) => void
}

export function EditDialog({ tag, open, onOpenChange, onTagUpdate }: EditDialogProps) {
  const [newTagName, setNewTagName] = useState(tag)
  const [searchQuery, setSearchQuery] = useState('')
  const [useFilenameAsTag, setUseFilenameAsTag] = useState(true)
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    if (open) {
      setNewTagName(tag)
      setSearchQuery('')
      setIsValid(true)
      setUseFilenameAsTag(true)
    }
  }, [open, tag])

  const handleUpdate = () => {
    const trimmedName = newTagName.trim()
    if (trimmedName && trimmedName !== tag) {
      onTagUpdate(tag, trimmedName)
      onOpenChange(false)
    }
  }

  const handleNameChange = (value: string) => {
    setNewTagName(value)
    setIsValid(value.trim().length > 0)
  }

  // Mock data for demonstration
  const mockFiles = searchQuery ? [
    { id: 1, name: 'Technische Dokumentation.pdf', type: 'PDF' },
    { id: 2, name: 'Projektplanung.xlsx', type: 'Spreadsheet' },
    { id: 3, name: 'Requirements.docx', type: 'Document' }
  ].filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Tag className="h-5 w-5" />
            Tag bearbeiten
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 pb-6 space-y-4">
          {/* Umbennen Section */}
          <div>
            <h3 className="font-semibold text-lg text-gray-900 mb-3">Umbennen</h3>
            <div className="space-y-2">
              <div className="flex gap-3">
                <Input
                  id="tagName"
                  value={newTagName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Neuen Namen eingeben..."
                  className={cn(
                    "flex-1",
                    !isValid && "border-red-500 focus-visible:ring-red-500"
                  )}
                />
                <Button 
                  onClick={handleUpdate}
                  disabled={!isValid || newTagName.trim() === tag}
                  className="min-w-[120px] bg-gray-100 text-gray-900 hover:bg-gray-200"
                  variant="secondary"
                >
                  Aktualisieren
                </Button>
              </div>
              {!isValid && (
                <p className="text-sm text-red-500">
                  Bitte geben Sie einen gültigen Tag-Namen ein
                </p>
              )}
            </div>
          </div>

          <div className="py-1">
            <div className="h-px bg-gray-200 w-full" />
          </div>

          {/* Verknüpfen Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg text-gray-900">Verknüpfen</h3>
            
            <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-3 border border-gray-100">
              <Checkbox 
                id="useFilename" 
                checked={useFilenameAsTag}
                onCheckedChange={(checked) => setUseFilenameAsTag(checked as boolean)}
                className="data-[state=checked]:bg-gray-900 data-[state=checked]:border-gray-900"
              />
              <label
                htmlFor="useFilename"
                className="text-sm text-gray-700 font-medium leading-none cursor-pointer select-none"
              >
                Dateiname als Tag-Name verwenden
              </label>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Nach Dateien suchen..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[200px] rounded-md border">
              {mockFiles.length > 0 ? (
                <div className="divide-y">
                  {mockFiles.map((file) => (
                    <button
                      key={file.id}
                      className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors text-left"
                      onClick={() => {
                        if (useFilenameAsTag) {
                          const filename = file.name.split('.')[0]
                          handleNameChange(filename)
                        }
                      }}
                    >
                      <Search className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{file.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-4 text-sm text-gray-500">
                  {searchQuery ? 'Keine Dateien gefunden' : 'Suchen Sie nach Dateien zum Verknüpfen...'}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}