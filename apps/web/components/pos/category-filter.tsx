'use client';

import { cn } from '@bizflow/ui';
import { usePosCategories } from '@/hooks/use-pos';
import { Skeleton, Button } from '@bizflow/ui';

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
      <Button
        onClick={() => onSelect(undefined)}
        variant={!selectedId ? 'default' : 'ghost'}
        size="sm"
        className={cn(
          'rounded-full px-4',
          !selectedId ? '' : 'bg-muted text-muted-foreground hover:bg-muted/80',
        )}
      >
        Semua
      </Button>

      {categories?.map((category) => (
        <Button
          key={category.id}
          onClick={() => onSelect(category.id)}
          variant={selectedId === category.id ? 'default' : 'ghost'}
          size="sm"
          className={cn(
            'rounded-full px-4',
            selectedId === category.id
              ? ''
              : 'bg-muted text-muted-foreground hover:bg-muted/80',
          )}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
}
