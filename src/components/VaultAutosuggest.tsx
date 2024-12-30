import React, { useState, useCallback, useEffect, useRef, forwardRef, useImperativeHandle } from 'react'
import { App, TFile } from 'obsidian'

interface VaultSearchResult {
  displayName: string
  file: TFile
}

interface VaultAutosuggestProps {
  app: App
  value?: string
  onSelect: (value: string) => void
  onAddTag?: (value: string) => void
  placeholder?: string
  className?: string
}

export interface VaultAutosuggestHandle {
  focus: () => void
}

const VaultAutosuggest = forwardRef<VaultAutosuggestHandle, VaultAutosuggestProps>(({
  app,
  value = '',
  onSelect,
  onAddTag,
  placeholder = 'Suchen oder Text eingeben...',
  className,
}, ref) => {
  const [results, setResults] = useState<VaultSearchResult[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const [isFocused, setIsFocused] = useState(false)

  useImperativeHandle(ref, () => ({
    focus: () => {
      inputRef.current?.focus()
      setIsFocused(true)
      setIsOpen(true)
    }
  }))

  const removeExtension = (filename: string) => {
    return filename.replace(/\.md$/, '')
  }

  const searchVault = useCallback((searchTerm: string) => {
    if (!searchTerm) {
      setResults([])
      return
    }

    const files = app.vault.getFiles()
    const searchResults = files
      .filter(file => {
        const nameWithoutExt = removeExtension(file.basename)
        return nameWithoutExt.toLowerCase().includes(searchTerm.toLowerCase())
      })
      .map(file => ({
        displayName: removeExtension(file.basename),
        file
      }))
      .slice(0, 5)

    setResults(searchResults)
  }, [app])

  useEffect(() => {
    if (isFocused && value) {
      searchVault(value)
      setIsOpen(true)
    }
  }, [value, searchVault, isFocused])

  const handleSelect = (selectedValue: string) => {
    if (onAddTag) {
      onAddTag(selectedValue)
    } else {
      onSelect(selectedValue)
    }
    setResults([])
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex].displayName)
      } else if (value.trim()) {
        handleSelect(value.trim())
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setSelectedIndex(-1)
    }
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (value) {
      setIsOpen(true)
      searchVault(value)
    }
  }

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false)
      setIsOpen(false)
      setSelectedIndex(-1)
    }, 200)
  }

  return (
    <div className="relative w-full">
      <div className={`flex items-center rounded-md ${className}`}>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onSelect(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          className="flex h-8 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full overflow-hidden rounded-md border bg-white p-1 shadow-md animate-in fade-in-0 zoom-in-95 mt-1">
          <div className="py-1.5">
            {results.map((result, idx) => (
              <div
                key={idx}
                onMouseDown={(e) => {
                  e.preventDefault()
                  handleSelect(result.displayName)
                }}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`relative flex select-none items-center rounded-sm px-3 py-1.5 text-sm outline-none cursor-pointer
                  ${idx === selectedIndex ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <span>{result.displayName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
})

VaultAutosuggest.displayName = 'VaultAutosuggest'

export default VaultAutosuggest