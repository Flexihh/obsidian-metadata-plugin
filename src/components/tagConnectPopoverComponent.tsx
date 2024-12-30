import React, { forwardRef, useImperativeHandle, useState } from 'react'
import { App } from "obsidian"
import VaultAutosuggest from './VaultAutosuggest'
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover"

interface TagFileConnectPopoverProps {
  app: App
  onSelect: (value: string) => void
  className?: string
}

export interface TagFileConnectPopoverHandle {
  open: (tag: string) => void
}

const TagFileConnectPopover = forwardRef<TagFileConnectPopoverHandle, TagFileConnectPopoverProps>(({
  app,
  onSelect,
  className
}, ref) => {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [currentTag, setCurrentTag] = useState('')

  useImperativeHandle(ref, () => ({
    open: (tag: string) => {
      setCurrentTag(tag)
      setIsOpen(true)
      setInputValue('')
    }
  }))

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor />
      <PopoverContent className="w-[300px] p-0" sideOffset={5}>
        <div className="p-2">
          <VaultAutosuggest
            app={app}
            value={inputValue}
            onSelect={setInputValue}
            onAddTag={(value) => {
              onSelect(value)
              setInputValue('')
              setIsOpen(false)
            }}
            placeholder={`Mit "${currentTag}" verbinden...`}
            className={className}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
})

TagFileConnectPopover.displayName = 'TagFileConnectPopover'

export default TagFileConnectPopover