import React, { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Pencil, X, Link as Chain, Unlink } from 'lucide-react' // Chain-Icon importiert
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
  const [isConnected, setIsConnected] = useState(false) // Zustand für verbunden/ausgewählt

  return (
    <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <PopoverTrigger asChild>
        <div>
          <Badge
            variant="outline"
            className={`group/badge px-2.5 py-0.5 
                        rounded-full text-sm font-normal 
                        transition-all flex items-center justify-between 
                        ${isOpen ? 'bg-gray-100 text-gray-900 border-gray-300' : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300'}`}
          >
            <span>{tag}</span>
            <div className="w-0 group-hover/badge:w-[63px] overflow-hidden transition-all duration-200">
              <div className="flex items-center justify-end gap-1 ml-0.5">
                <Pencil
                  className="h-3.5 w-3.5 text-gray-400 hover:text-blue-500 cursor-pointer shrink-0 transition-colors"
                  onClick={() => onEdit(tag)}
                />
                {isConnected ? (
                  <Chain
                    className="h-3.5 w-3.5 text-green-500 hover:text-green-700 cursor-pointer shrink-0 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsConnected(false) // Verbindung aufheben
                    }}
                  />
                ) : (
                  <Unlink
                    className={`h-3.5 w-3.5 cursor-pointer shrink-0 transition-colors 
                                ${isOpen ? 'text-gray-400 hover:text-gray-400' : 'text-gray-400 hover:text-green-500'}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsOpen(true)
                    }}
                  />
                )}
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
            onSelect={(value) => {
              if (value !== null) {
                setInputValue(value)
              }
              setIsConnected(true) // Datei ausgewählt
              setIsOpen(false) // Popup schließen
            }}
            onAddTag={(value) => {
              onConnect(value)
              setInputValue('')
              setIsConnected(true) // Verbindung herstellen
              setIsOpen(false) // Popup schließen
            }}
            placeholder={`Mit "${tag}" verbinden...`}
            className="h-8 px-2 border border-transparent rounded-md text-sm shadow-none hover:border-gray-300 focus:ring-2 focus:ring-gray-400"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}
