'use client';

import {
  ChevronDown,
  Search,
  SlidersHorizontal,
  Settings2,
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
}: UsersToolbarProps) {
  const { roles } = useRoles(); // Fetch roles for filter

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
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari user..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>

        <Select value={roleId} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            {roles.map((role) => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={onStatusFilterChange}>
          <SelectTrigger className="w-full md:w-[150px]">
            <div className="flex items-center">
              <span className="mr-2">Status:</span>
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>

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
