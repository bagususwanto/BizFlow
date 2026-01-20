'use client';

import { ChevronDown, Search, Settings2, X } from 'lucide-react';

import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
} from '@bizflow/ui';

interface UnitsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (value: Record<string, boolean>) => void;
  onReset: () => void;
}

export function UnitsToolbar({
  search,
  onSearchChange,
  columnVisibility,
  onColumnVisibilityChange,
  onReset,
}: UnitsToolbarProps) {
  const isFiltered = search !== '';

  const columns = [
    { id: 'name', label: 'Nama Satuan' },
    { id: 'symbol', label: 'Simbol' },
    { id: 'baseUnit', label: 'Base Unit' },
    { id: 'conversionRate', label: 'Konversi' },
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        <div className="relative w-full md:w-[200px] lg:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari satuan..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Settings2 className="mr-2 h-4 w-4" />
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {columns.map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={columnVisibility[column.id] !== false}
                    onCheckedChange={(value) =>
                      onColumnVisibilityChange({
                        ...columnVisibility,
                        [column.id]: !!value,
                      })
                    }
                  >
                    {column.label}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
