  import React from 'react';
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
  } from "@/components/ui/dropdown-menu";
  import {
    ChevronUp,
    ChevronDown,
    Search,
    Copy,
    Trash2,
    HelpCircle,
    LucideIcon,
  } from 'lucide-react';
  import * as LucideIcons from 'lucide-react';
  import { Checkbox } from "@/components/ui/checkbox";
  import { CATEGORIES } from '../constants';
  import { Action, MetadataPlugin } from '../types';
  import { App } from 'obsidian';

  interface CategorySubmenuProps {
    app: App;
    plugin: MetadataPlugin;
    actions: Action[];
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
    app,
    plugin,
    actions,
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

    const executeCommand = (commandId: string) => {
      console.log(`Attempting to execute command: ${commandId} for rowId: ${rowId}`);
      
      if (commandId.startsWith('metadata-plugin:')) {
          // Plugin commands verwenden die plugin.executeCommand Methode
          const result = plugin.executeCommand(commandId, rowId);
          console.log('Plugin command execution result:', result);
      } else if (commandId.startsWith('app:')) {
          // App commands direkt über app.commands ausführen
          app.commands.executeCommandById(commandId);
      } else {
          // Andere commands über die normale command API
          const command = app.commands.commands[commandId];
          if (command) {
              if (command.callback) {
                  command.callback();
              } else if (command.checkCallback) {
                  command.checkCallback(false);
              }
          } else {
              console.warn(`Command ${commandId} not found in app.commands`);
          }
      }
  };

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
            <ChevronUp className="h-4 w-4" />
            <span>Move Up</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onMoveDown(rowId)}
            disabled={index === visibleRowsLength - 1 || isLocked}
            className="flex items-center gap-2 py-1.5"
          >
            <ChevronDown className="h-4 w-4" />
            <span>Move Down</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onSearch(category || '')}
            disabled={isLocked}
            className="flex items-center gap-2 py-1.5"
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDuplicate(rowId)}
            disabled={isLocked}
            className="flex items-center gap-2 py-1.5"
          >
            <Copy className="h-4 w-4" />
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete(rowId)}
            className={`flex items-center gap-2 py-1.5 ${
              isLocked ? "text-gray-400" : "text-red-600 hover:text-red-700"
            }`}
            disabled={isLocked}
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex items-center gap-2 py-1.5">
            <Checkbox
              checked={isLocked}
              onCheckedChange={() => onToggleLock(rowId)}
              className="mr-2"
            />
            <span>{isLocked ? "Locked" : "Unlocked"}</span>
          </DropdownMenuItem>

          {/* Actions Submenu */}
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center gap-2 py-1.5">
              <span>Actions</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-40">
              {actions.map((action, idx) => (
                <DropdownMenuItem
                  key={idx}
                  className="flex items-center gap-2 py-1.5"
                  onClick={() => executeCommand(action.command)}
                >
                  <span>{action.name || action.command}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  export default CategorySubmenu;