'use client';

import {
  Building2,
  Calendar,
  ChevronRight,
  Edit,
  Folder,
  History,
  MoreVertical,
  Trash2,
} from 'lucide-react';
import { useRouter } from 'next/navigation';

import type { CategoryWithRelations } from '@bizflow/types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Separator,
  Badge,
  Skeleton,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@bizflow/ui';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface CategoryDetailProps {
  category?: CategoryWithRelations;
  isLoading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CategoryDetail({
  category,
  isLoading,
  onEdit,
  onDelete,
}: CategoryDetailProps) {
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="space-y-6 h-full p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-9 w-24" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-muted-foreground">
        <Folder className="mb-4 h-12 w-12 text-muted-foreground/20" />
        <h3 className="text-lg font-medium text-foreground">Detail Kategori</h3>
        <p className="text-sm">
          Pilih kategori untuk melihat detail dan sub-kategori.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-6 bg-muted/10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">
              {category.name}
            </h2>
            <Badge variant={category.isActive ? 'default' : 'secondary'}>
              {category.isActive ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-mono text-xs text-muted-foreground/70">
              #{category.id}
            </span>
            {category.parent && (
              <>
                <ChevronRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  <span>{category.parent.name}</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(category.id)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Apakah anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Kategori ini akan
                    dihapus secara permanen dari sistem.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-white hover:bg-destructive/80"
                    onClick={() => onDelete(category.id)}
                  >
                    Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  router.push(
                    `/master-data/categories/create?parentId=${category.id}`,
                  )
                }
              >
                <Folder className="mr-2 h-4 w-4" />
                Tambah Sub-kategori
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Statistics / Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {category.productCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Item terdaftar dalam kategori ini
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Sub-kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {category.children?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Level turunan langsung
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {category.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold leading-none">Deskripsi</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Sub-categories List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold leading-none flex items-center gap-2">
            <Folder className="h-4 w-4 text-blue-500" />
            Sub-kategori
          </h4>

          {!category.children || category.children.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              Tidak ada sub-kategori.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Folder className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {(child as any).productCount || 0} produk
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <History className="h-3 w-3" />
            <span>
              Dibuat:{' '}
              {format(new Date(category.createdAt), 'dd MMMM yyyy, HH:mm', {
                locale: idLocale,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Edit className="h-3 w-3" />
            <span>
              Diupdate:{' '}
              {format(new Date(category.updatedAt), 'dd MMMM yyyy, HH:mm', {
                locale: idLocale,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
