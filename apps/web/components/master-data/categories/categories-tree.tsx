'use client';

import { ChevronDown, ChevronRight, Folder, FolderOpen } from 'lucide-react';
import * as React from 'react';
import { useTranslations } from 'next-intl';

import type { CategoryTreeNode } from '@bizflow/types';
import { cn, ScrollArea } from '@bizflow/ui';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoriesTreeProps {
  data: CategoryTreeNode[];
  selectedId?: string;
  onSelect: (id: string) => void;
  onReorder?: (id: string, parentId: string | null, index: number) => void;
  className?: string;
}

interface TreeNodeProps {
  node: CategoryTreeNode;
  level: number;
  selectedId?: string;
  onSelect: (id: string) => void;
  isExpanded?: boolean;
  onToggleExpand: (id: string) => void;
  renderChildren: (node: CategoryTreeNode, level: number) => React.ReactNode;
}

function SortableTreeNode({
  node,
  level,
  selectedId,
  onSelect,
  isExpanded,
  onToggleExpand,
  renderChildren,
}: TreeNodeProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id, data: { node } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const hasChildren = node.children && node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="w-full select-none outline-none"
    >
      <div
        className={cn(
          'flex items-center gap-2 rounded-md py-1.5 pr-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer group',
          isSelected && 'bg-accent text-accent-foreground font-medium',
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => onSelect(node.id)}
        {...attributes}
        {...listeners}
      >
        {/* Toggle Button */}
        <div
          role="button"
          className={cn(
            'flex h-6 w-6 shrink-0 items-center justify-center rounded-sm hover:bg-muted/50 transition-colors',
            (!node.children || node.children.length === 0) && 'invisible',
          )}
          onPointerDown={(e) => e.stopPropagation()} // Prevent drag start when clicking toggle
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(node.id);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>

        {/* Icon */}
        {isExpanded ? (
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
      {isExpanded && node.children && node.children.length > 0 && (
        <div className="flex flex-col border-l border-border/50 ml-[19px]">
          {renderChildren(node, level + 1)}
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
  onReorder,
  className,
}: CategoriesTreeProps) {
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const t = useTranslations('categories');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Requires 5px movement before drag starts (prevents accidental drags on click)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const findNodeInfo = (
    nodes: CategoryTreeNode[],
    id: string,
    parentId: string | null = null,
  ): {
    node: CategoryTreeNode;
    parentId: string | null;
    index: number;
  } | null => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (!node) continue;
      if (node.id === id) {
        return { node, parentId, index: i };
      }
      if (node.children) {
        const found = findNodeInfo(node.children, id, node.id);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id || !onReorder) {
      return;
    }

    const activeInfo = findNodeInfo(data, active.id as string);
    const overInfo = findNodeInfo(data, over.id as string);

    if (activeInfo && overInfo) {
      // Reorder logic:
      // We are moving 'active' to 'over' position.
      // parentId checks:
      // If dropping ON an item, we assume we want to place it RELATIVE to that item (above/below).
      // Since we use Sortable, 'over' is the item we are hovering over.
      // So new parent is overInfo.parentId.
      // New index is overInfo.index.

      // Note: This logic places 'active' AT 'over' index.
      // If active was previously in same list and active.index < over.index, visually it moves "after".
      // But server Reorder considers index.

      onReorder(active.id as string, overInfo.parentId, overInfo.index);
    }
  };

  // Helper to render recursively with proper state
  const renderList = (nodes: CategoryTreeNode[], level: number) => {
    return (
      <SortableContext
        items={nodes.map((n) => n.id)}
        strategy={verticalListSortingStrategy}
      >
        {nodes.map((node) => (
          <SortableTreeNode
            key={node.id}
            node={node}
            level={level}
            selectedId={selectedId}
            onSelect={onSelect}
            isExpanded={expanded[node.id]}
            onToggleExpand={(id) =>
              setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
            }
            renderChildren={(n, l) => renderList(n.children, l)}
          />
        ))}
      </SortableContext>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <ScrollArea className={cn('h-full', className)}>
        <div className="flex flex-col gap-0.5 p-2">
          {renderList(data, 0)}

          {data.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              {t('empty')}
            </div>
          )}
        </div>
      </ScrollArea>
    </DndContext>
  );
}
