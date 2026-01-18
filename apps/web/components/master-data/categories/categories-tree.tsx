'use client';

import {
  ChevronDown,
  ChevronRight,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Plus,
} from 'lucide-react';
import * as React from 'react';

import type { CategoryTreeNode } from '@bizflow/types';
import {
  Button,
  cn,
  ScrollArea,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@bizflow/ui';

interface CategoriesTreeProps {
  data: CategoryTreeNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
  className?: string;
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  level: number;
  selectedId?: string;
  onSelect: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand: (id: string) => void;
}

function TreeNode({
  node,
  level,
  selectedId,
  onSelect,
  isExpanded,
  onToggleExpand,
}: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div className="w-full select-none">
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer',
          isSelected && 'bg-accent text-accent-foreground font-medium',
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
      >
        <div
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm hover:bg-muted-foreground/20',
            !hasChildren && 'invisible',
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3 w-3" />
          ) : (
            <ChevronRight className="h-3 w-3" />
          )}
        </div>

        {isExpanded ? (
          <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
        ) : (
          <Folder className="h-4 w-4 shrink-0 text-blue-500" />
        )}

        <span className="truncate flex-1">{node.name}</span>

        {node.productCount > 0 && (
          <span className="text-xs text-muted-foreground">
            ({node.productCount})
          </span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              isExpanded={isExpanded} // TODO: Manage global expansion state or pass down individual state
              onToggleExpand={onToggleExpand} // This logic needs to be lifted up or handled better for deep nesting
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Logic to handle expansion state map
export function CategoriesTree({
  data,
  selectedId,
  onSelect,
  className,
}: CategoriesTreeProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  // Helper to render recursively with proper state
  const renderNode = (node: CategoryTreeNode, level: number) => {
    const isNodeExpanded = expanded[node.id];

    // Auto-expand if a child is selected? (Optional UX enhancement)

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer group',
            selectedId === node.id &&
              'bg-accent text-accent-foreground font-medium',
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => onSelect(node.id)}
        >
          {/* Toggle Button */}
          <div
            role="button"
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm hover:bg-muted/50 transition-colors',
              (!node.children || node.children.length === 0) && 'invisible',
            )}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((prev) => ({ ...prev, [node.id]: !prev[node.id] }));
            }}
          >
            {isNodeExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </div>

          {/* Icon */}
          {isNodeExpanded ? (
            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500/20" />
          ) : (
            <Folder className="h-4 w-4 shrink-0 text-amber-500 fill-amber-500/20" />
          )}

          {/* Label */}
          <span className="truncate flex-1 ml-1.5">{node.name}</span>

          {/* Meta */}
          <span className="text-xs text-muted-foreground tabular-nums group-hover:text-accent-foreground/70">
            ({node.productCount})
          </span>
        </div>

        {/* Children */}
        {isNodeExpanded && node.children && node.children.length > 0 && (
          <div className="flex flex-col border-l border-border/50 ml-[19px]">
            {node.children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <ScrollArea className={cn('h-full', className)}>
      <div className="flex flex-col gap-0.5 p-2">
        {data.map((node) => renderNode(node, 0))}

        {data.length === 0 && (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada kategori
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
