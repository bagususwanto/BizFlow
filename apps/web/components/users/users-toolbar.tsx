'use client';

import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  Settings2,
  X,
} from 'lucide-react';

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
  Combobox,
} from '@bizflow/ui';
import { useRoles } from '@/hooks/use-roles';

interface UsersToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleId: string;
  onRoleFilterChange: (value: string) => void;
  status: string;
  onStatusFilterChange: (value: string) => void;
  columnVisibility: Record<string, boolean>;
  onColumnVisibilityChange: (value: Record<string, boolean>) => void;
  onReset: () => void;
}

export function UsersToolbar({
  search,
  onSearchChange,
  roleId,
  onRoleFilterChange,
  status,
  onStatusFilterChange,
  columnVisibility,
  onColumnVisibilityChange,
  onReset,
}: UsersToolbarProps) {
  const { roles } = useRoles(); // Fetch roles for filter

  const isFiltered = search !== '' || roleId !== 'all' || status !== 'all';

  const columns = [
    { id: 'username', label: 'Username' },
    { id: 'name', label: 'Nama Lengkap' },
    { id: 'role.name', label: 'Role' },
    { id: 'isActive', label: 'Status' },
    { id: 'lastLogin', label: 'Login Terakhir' },
  ];

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
        <div className="relative w-full md:w-[200px] lg:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Combobox
          value={roleId}
          onChange={(val) => onRoleFilterChange(val || 'all')}
          options={[
            { value: 'all', label: 'Semua Role' },
            ...roles.map((role) => ({
              value: role.id,
              label: role.name,
            })),
          ]}
          placeholder="Filter Role"
          searchPlaceholder="Cari Role..."
          className="w-full md:w-[150px] lg:w-[180px]"
        />

        <Select value={status} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full md:w-[120px] lg:w-[150px]">
            <div className="flex items-center">
              <span className="mr-2">Status:</span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent className="max-h-[300px] overflow-y-auto">
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
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
