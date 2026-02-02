'use client';

import { cn } from '@bizflow/ui';
import { usePosCategories } from '@/hooks/use-pos';
import { Skeleton } from '@bizflow/ui';

interface CategoryFilterProps {
  selectedId: string | undefined;
  onSelect: (id: string | undefined) => void;
}

export function CategoryFilter({ selectedId, onSelect }: CategoryFilterProps) {
  const { data: categories, isLoading } = usePosCategories();

  if (isLoading) {
    return (
      <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-8 w-24 rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
      <button
        onClick={() => onSelect(undefined)}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
          !selectedId
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        Semua
      </button>

      {categories?.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={cn(
            'px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors shrink-0',
            selectedId === category.id
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
