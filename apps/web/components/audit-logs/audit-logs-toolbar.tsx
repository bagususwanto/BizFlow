'use client';

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Button,
  Combobox,
} from '@bizflow/ui';
import { Search, X, Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@bizflow/ui';
import { Calendar } from '@bizflow/ui';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { AVAILABLE_MODULES, AVAILABLE_ACTIONS } from '@bizflow/types';
import { ChevronDown, Settings2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@bizflow/ui';

interface AuditLogsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  moduleFilter: string;
  onModuleFilterChange: (value: string) => void;
  actionFilter: string;
  onActionFilterChange: (value: string) => void;
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate?: Date, endDate?: Date) => void;
  onReset: () => void;
  columnVisibility?: Record<string, boolean>;
  onColumnVisibilityChange?: (value: Record<string, boolean>) => void;
}

export function AuditLogsToolbar({
  search,
  onSearchChange,
  moduleFilter,
  onModuleFilterChange,
  actionFilter,
  onActionFilterChange,
  startDate,
  endDate,
  onDateRangeChange,
  onReset,
  columnVisibility = {},
  onColumnVisibilityChange,
}: AuditLogsToolbarProps) {
  const isFiltered =
    search !== '' ||
    moduleFilter !== 'all' ||
    actionFilter !== 'all' ||
    startDate !== undefined ||
    endDate !== undefined;

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari ID Entity..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Combobox
          value={moduleFilter}
          onChange={(val) => onModuleFilterChange(val || 'all')}
          options={[
            { value: 'all', label: 'Semua Module' },
            ...AVAILABLE_MODULES.map((module) => ({
              value: module,
              label: module.charAt(0).toUpperCase() + module.slice(1),
            })),
          ]}
          placeholder="Module"
          searchPlaceholder="Cari Module..."
          className="w-[150px]"
        />

        <Select value={actionFilter} onValueChange={onActionFilterChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Aksi" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            <SelectItem value="all">Semua Aksi</SelectItem>
            {AVAILABLE_ACTIONS.map((action) => (
              <SelectItem key={action} value={action} className="capitalize">
                {action}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-[240px] justify-start text-left font-normal',
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

        {onColumnVisibilityChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <Settings2 className="mr-2 h-4 w-4" />
                Kolom
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {[
                { id: 'time', label: 'Waktu' },
                { id: 'user', label: 'User' },
                { id: 'module', label: 'Module' },
                { id: 'action', label: 'Aksi' },
                { id: 'entity', label: 'Entity' },
                { id: 'ipAddress', label: 'IP Address' },
              ].map((column) => {
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
        )}
      </div>
    </div>
  );
}
