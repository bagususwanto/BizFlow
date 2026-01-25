'use client';

import {
  Search,
  Settings2,
  Plus,
  X,
  Calendar as CalendarIcon,
} from 'lucide-react';
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
  Popover,
  PopoverContent,
  PopoverTrigger,
  Calendar,
} from '@bizflow/ui';
import { ReactNode } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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

  // Date Range
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange?: (startDate?: Date, endDate?: Date) => void;

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
  startDate,
  endDate,
  onDateRangeChange,
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
    ) ||
    startDate !== undefined ||
    endDate !== undefined;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center md:flex-wrap lg:flex-nowrap">
        {/* Search */}
        {onSearchChange && (
          <div className="relative w-full md:w-auto md:flex-1 md:min-w-[200px] lg:w-[300px] lg:flex-none">
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
            <SelectTrigger className={filter.width || 'w-full md:w-[150px]'}>
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

        {/* Date Range Picker */}
        {onDateRangeChange && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full md:w-auto md:min-w-[220px] justify-start text-left font-normal',
                  !startDate && 'text-muted-foreground',
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? (
                  endDate ? (
                    <>
                      {format(startDate, 'dd/MM/yyyy')} -{' '}
                      {format(endDate, 'dd/MM/yyyy')}
                    </>
                  ) : (
                    format(startDate, 'dd/MM/yyyy')
                  )
                ) : (
                  <span>Pilih Tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={startDate}
                selected={{
                  from: startDate,
                  to: endDate,
                }}
                onSelect={(range) => onDateRangeChange(range?.from, range?.to)}
                numberOfMonths={2}
                locale={id}
              />
            </PopoverContent>
          </Popover>
        )}

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
