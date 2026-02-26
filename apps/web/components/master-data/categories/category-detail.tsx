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
import { useState } from 'react';
import { DeleteConfirmDialog } from '../../shared/delete-confirm-dialog';
import { useTranslations } from 'next-intl';

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
} from '@bizflow/ui';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface CategoryDetailProps {
  category?: CategoryWithRelations;
  isLoading?: boolean;
  isDeleting?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function CategoryDetail({
  category,
  isLoading,
  isDeleting,
  onEdit,
  onDelete,
}: CategoryDetailProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');

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
        <h3 className="text-lg font-medium text-foreground">
          {t('detail.title')}
        </h3>
        <p className="text-sm">{t('detail.empty')}</p>
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
              {category.isActive ? t('status.active') : t('status.inactive')}
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
              {tCommon('edit')}
            </Button>
          )}
          {onDelete && (
            <>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {category.isActive
                  ? t('detail.delete.btnDeactivate')
                  : tCommon('delete')}
              </Button>
              <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                title={
                  category.isActive
                    ? t('detail.delete.titleActive')
                    : t('detail.delete.titlePermanent')
                }
                description={
                  category.isActive ? (
                    t.rich('detail.delete.descActive', {
                      name: category.name,
                      bold: (chunks) => (
                        <span className="font-medium text-foreground">
                          {chunks}
                        </span>
                      ),
                    })
                  ) : (
                    <>
                      <p>
                        {t.rich('detail.delete.descPermanent1', {
                          name: category.name,
                          bold: (chunks) => (
                            <span className="font-medium text-foreground">
                              {chunks}
                            </span>
                          ),
                        })}
                      </p>
                      <p className="mt-2 text-sm text-warning">
                        {t('detail.delete.descPermanent2')}
                      </p>
                    </>
                  )
                }
                confirmLabel={
                  category.isActive
                    ? t('detail.delete.btnDeactivate')
                    : t('detail.delete.btnDeletePermanent')
                }
                cancelLabel={tCommon('cancel')}
                onConfirm={() => onDelete(category.id)}
                isDeleting={isDeleting}
              />
            </>
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
                {t('detail.addSubCategory')}
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
                {t('detail.totalProducts')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {category.productCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('detail.totalProductsDesc')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('detail.subCategories')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {category.children?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {t('detail.subCategoriesDesc')}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Description */}
        {category.description && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold leading-none">
              {t('detail.description')}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {category.description}
            </p>
          </div>
        )}

        <Separator />

        {/* Sub-categories List */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold leading-none flex items-center gap-2">
            <Folder className="h-4 w-4 text-info" />
            {t('detail.subCategories')}
          </h4>

          {!category.children || category.children.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">
              {t('detail.noSubCategories')}
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.children.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info/20">
                    <Folder className="h-4 w-4 text-info" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{child.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {t('detail.productCount', {
                        count: (child as any).productCount || 0,
                      })}
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
              {t('detail.createdAt')}{' '}
              {format(new Date(category.createdAt), 'dd MMMM yyyy, HH:mm', {
                locale: idLocale,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Edit className="h-3 w-3" />
            <span>
              {t('detail.updatedAt')}{' '}
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
