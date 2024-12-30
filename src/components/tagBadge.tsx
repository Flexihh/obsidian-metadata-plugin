import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Pencil, X, Unlink } from 'lucide-react'
import { App } from "obsidian"
import VaultAutosuggest from './VaultAutosuggest'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface TagBadgeProps {
  app: App
  tag: string
  onEdit: (tag: string) => void
  onRemove: (tag: string) => void
  onConnect: (value: string) => void
}

export function TagBadge({ 
  app,
  tag, 
  onEdit, 
  onRemove, 
  onConnect 
}: TagBadgeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div>
          <Badge
            variant="outline"
            className="group/badge px-2.5 py-0.5 bg-white hover:bg-gray-100 rounded-full text-sm font-normal text-gray-700 border-gray-200 transition-all flex items-center justify-between"
          >
            <span>{tag}</span>
            <div className="w-0 group-hover/badge:w-[63px] overflow-hidden transition-all duration-200">
              <div className="flex items-center justify-end gap-1 ml-0.5">
                <Pencil
                  className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500 cursor-pointer shrink-0 transition-colors"
                  onClick={() => onEdit(tag)}
                />
                <Unlink
                  className="h-3.5 w-3.5 text-gray-400 hover:text-purple-500 cursor-pointer shrink-0 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(true)
                  }}
                />
                <X
                  className="h-3.5 w-3.5 text-gray-400 hover:text-red-500 cursor-pointer shrink-0 transition-colors"
                  onClick={() => onRemove(tag)}
                />
              </div>
            </div>
          </Badge>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <div className="p-2">
          <VaultAutosuggest
            app={app}
            value={inputValue}
            onSelect={setInputValue}
            onAddTag={(value) => {
              onConnect(value)
              setInputValue('')
              setIsOpen(false)
            }}
            placeholder={`Mit "${tag}" verbinden...`}
            className="h-8 px-2 border border-transparent rounded-md text-sm shadow-none hover:border-gray-300 focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}