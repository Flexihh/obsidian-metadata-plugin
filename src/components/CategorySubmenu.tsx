import React from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { ChevronUp, ChevronDown, Search, Copy, Trash2, HelpCircle, LucideIcon } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { CATEGORIES } from '../constants';

interface CategorySubmenuProps {
  rowId: number;
  index: number;
  visibleRowsLength: number;
  onMoveUp: (rowId: number) => void;
  onMoveDown: (rowId: number) => void;
  onDuplicate: (rowId: number) => void;
  onDelete: (rowId: number) => void;
  onSearch: (category: string) => void;
  isLocked?: boolean;
  category?: string;
  onToggleLock: (rowId: number) => void;
}

const getCategoryIcon = (category: string): LucideIcon => {
  const matchedCategory = CATEGORIES.find((cat) => cat.label === category);
  return matchedCategory?.icon
    ? (LucideIcons[matchedCategory.icon as keyof typeof LucideIcons] as LucideIcon)
    : HelpCircle;
};

const CategorySubmenu: React.FC<CategorySubmenuProps> = ({
  rowId,
  index,
  visibleRowsLength,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onDelete,
  onSearch,
  isLocked = false,
  category,
  onToggleLock,
}) => {
  const CategoryIcon = category ? getCategoryIcon(category) : HelpCircle;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="p-1 cursor-pointer rounded hover:bg-gray-100 transition-colors">
          <CategoryIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48" align="start">
        <DropdownMenuItem
          onClick={() => onMoveUp(rowId)}
          disabled={index === 0 || isLocked}
          className="flex items-center gap-2 py-1.5"
        >
          <ChevronUp className="h-3.5 w-3.5" />
          <span className="text-sm">Nach oben</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onMoveDown(rowId)}
          disabled={index === visibleRowsLength - 1 || isLocked}
          className="flex items-center gap-2 py-1.5"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          <span className="text-sm">Nach unten</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onSearch(category || '')}
          disabled={isLocked}
          className="flex items-center gap-2 py-1.5"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-sm">Suchen</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDuplicate(rowId)}
          disabled={isLocked}
          className="flex items-center gap-2 py-1.5"
        >
          <Copy className="h-3.5 w-3.5" />
          <span className="text-sm">Duplizieren</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(rowId)}
          className={`flex items-center gap-2 py-1.5 ${
            isLocked ? "text-gray-400" : "text-red-600 hover:text-red-700"
          }`}
          disabled={isLocked}
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span className="text-sm">Löschen</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="flex items-center gap-2 py-1.5">
          <Checkbox
            checked={isLocked}
            onCheckedChange={() => onToggleLock(rowId)}
            className="mr-2"
          />
          <span className="text-sm">{isLocked ? "Gesperrt" : "Entsperrt"}</span>
        </DropdownMenuItem>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-2 py-1.5">
            <span className="text-sm">Actions</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-40">
            <DropdownMenuItem className="flex items-center gap-2 py-1.5">
              <Copy className="h-3.5 w-3.5" />
              <span className="text-sm">Copy to Clipboard</span>
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2 py-1.5">
                <span className="text-sm">Custom</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-36">
                <DropdownMenuItem className="flex items-center gap-2 py-1.5">
                  <span className="text-sm">Custom Action 1</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2 py-1.5">
                  <span className="text-sm">Custom Action 2</span>
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CategorySubmenu;
