'use client';

import { X, SlidersHorizontal } from 'lucide-react';
import { OnChangeFn } from '@tanstack/react-table';

import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';

interface CustomersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onReset: () => void;
  status: string;
  onStatusChange: (value: string) => void;
}

export function CustomersToolbar({
  search,
  onSearchChange,
  columnVisibility,
  onColumnVisibilityChange,
  onReset,
  status,
  onStatusChange,
}: CustomersToolbarProps) {
  const isFiltered = search.length > 0 || status !== 'all';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          placeholder="Cari pelanggan..."
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          className="h-8 w-full sm:w-[250px]"
        />

        <Select value={status} onValueChange={onStatusChange}>
          <SelectTrigger className="h-8 w-full sm:w-[150px]">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground hidden sm:inline-block">
                Status:
              </span>
              <SelectValue placeholder="Status" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Non-aktif</SelectItem>
          </SelectContent>
        </Select>

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
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 hidden lg:flex"
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Tampilan
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[150px]">
          <DropdownMenuLabel>Toggle kolom</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={columnVisibility.code !== false}
            onCheckedChange={(value) =>
              onColumnVisibilityChange({ ...columnVisibility, code: value })
            }
          >
            Kode
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columnVisibility.name !== false}
            onCheckedChange={(value) =>
              onColumnVisibilityChange({ ...columnVisibility, name: value })
            }
          >
            Nama
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columnVisibility.phone !== false}
            onCheckedChange={(value) =>
              onColumnVisibilityChange({ ...columnVisibility, phone: value })
            }
          >
            Telepon
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columnVisibility.email !== false}
            onCheckedChange={(value) =>
              onColumnVisibilityChange({ ...columnVisibility, email: value })
            }
          >
            Email
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columnVisibility.creditLimit !== false}
            onCheckedChange={(value) =>
              onColumnVisibilityChange({
                ...columnVisibility,
                creditLimit: value,
              })
            }
          >
            Credit Limit
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={columnVisibility.isActive !== false}
            onCheckedChange={(value) =>
              onColumnVisibilityChange({ ...columnVisibility, isActive: value })
            }
          >
            Status
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
