import React, { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'

interface SearchPopoverProps {
  category: string
  onSearch?: (searchTerm: string) => void
}

export function SearchPopover({ category, onSearch }: SearchPopoverProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    onSearch?.(value)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Search 
          className="h-4 w-4 text-gray-400 opacity-0 group-focus-within:opacity-100 transition-opacity cursor-pointer hover:text-gray-600" 
        />
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-900">Suche in {category}</h4>
            <p className="text-xs text-gray-500">
              Geben Sie einen Suchbegriff ein um relevante {category} zu finden
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Suchen..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="pt-2 text-xs text-gray-500">
            Drücken Sie Enter um zu suchen
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}