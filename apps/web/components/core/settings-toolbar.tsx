'use client';

import { Search, Settings2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import {
  Button,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';
import { ReactNode } from 'react';

export interface FilterConfig {
  key: string;
  label: string;
  options: { label: string; value: string }[];
  defaultValue?: string;
  width?: string;
}

interface SettingsToolbarProps {
  // Search
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;

  // Filters
  filters?: FilterConfig[];
  filterValues?: Record<string, string>;
  onFilterChange?: (key: string, value: string) => void;

  // Column Visibility
  columns?: { id: string; label: string }[];
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (value: Record<string, boolean>) => void;

  // Actions
  onReset?: () => void;
  createLink?: string;
  createLabel?: string;

  // Custom Actions
  extraActions?: ReactNode;
}

export function SettingsToolbar({
  search = '',
  onSearchChange,
  searchPlaceholder = 'Cari...',
  filters = [],
  filterValues = {},
  onFilterChange,
  columns = [],
  columnVisibility = {},
  onColumnVisibilityChange,
  onReset,
  createLink,
  createLabel = 'Tambah Baru',
  extraActions,
}: SettingsToolbarProps) {
  const isFiltered =
    search !== '' ||
    Object.keys(filterValues).some(
      (key) =>
        filterValues[key] !== 'all' &&
        filterValues[key] !== undefined &&
        filterValues[key] !== '',
    );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        {/* Search */}
        {onSearchChange && (
          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-8"
            />
          </div>
        )}

        {/* Dynamic Filters */}
        {filters.map((filter) => (
          <Select
            key={filter.key}
            value={filterValues[filter.key] ?? filter.defaultValue ?? 'all'}
            onValueChange={(value) => onFilterChange?.(filter.key, value)}
          >
            <SelectTrigger className={filter.width || 'w-full md:w-[200px]'}>
              <div className="flex items-center">
                <span className="mr-2 hidden lg:inline-block">
                  {filter.label}:
                </span>
                <SelectValue placeholder={`Pilih ${filter.label}`} />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] overflow-y-auto">
              <SelectItem value="all">Semua</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        {/* Reset Button */}
        {isFiltered && onReset && (
          <Button
            variant="ghost"
            onClick={onReset}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}

        {/* Extra Actions (e.g. Export) */}
        {extraActions}

        {/* Create Button & Column Visibility */}
        <div className="ml-auto flex items-center gap-2">
          {createLink && (
            <Button asChild>
              <Link href={createLink}>
                <Plus className="mr-2 h-4 w-4" />
                {createLabel}
              </Link>
            </Button>
          )}

          {onColumnVisibilityChange && columns.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {columns.map((column) => (
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
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
