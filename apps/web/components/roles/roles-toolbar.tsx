'use client';

import { Search, SlidersHorizontal } from 'lucide-react';

import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@bizflow/ui';

interface RolesToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  roleType: string;
  onRoleTypeChange: (value: string) => void;
  pageSize: number;
  onPageSizeChange: (value: number) => void;
}

export function RolesToolbar({
  search,
  onSearchChange,
  roleType,
  onRoleTypeChange,
  pageSize,
  onPageSizeChange,
}: RolesToolbarProps) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 items-center gap-2">
        <div className="relative w-full md:w-[300px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari role..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={roleType} onValueChange={onRoleTypeChange}>
          <SelectTrigger className="w-[180px]">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Tipe Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Role</SelectItem>
            <SelectItem value="true">System Role</SelectItem>
            <SelectItem value="false">Custom Role</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(Number(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Baris per halaman" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5 per hal</SelectItem>
            <SelectItem value="10">10 per hal</SelectItem>
            <SelectItem value="20">20 per hal</SelectItem>
            <SelectItem value="50">50 per hal</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
