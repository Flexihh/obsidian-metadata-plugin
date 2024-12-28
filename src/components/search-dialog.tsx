'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Search } from 'lucide-react'

interface SearchDialogProps {
  tag: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ tag, open, onOpenChange }: SearchDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Suche nach &quot;{tag}&quot;</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Suchbegriff eingeben..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="min-h-[200px] rounded-md border p-4">
            <div className="text-sm text-muted-foreground">
              Suche nach Übereinstimmungen mit dem Tag &quot;{tag}&quot;...
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

