'use client';

import { Suspense, useCallback, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import {
  useCategoryTree,
  useCategory,
  useDeleteCategory,
  useReorderCategory,
} from '@/hooks';
import {
  CategoriesTree,
  CategoryDetail,
} from '@/components/master-data/categories';
import { DataListPage } from '@/components/shared/data-list-page';
import { CategoryWithRelations } from '@bizflow/types';
import { ColumnDef } from '@tanstack/react-table';

function CategoriesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get state from URL params
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || 'all';
  const selectedId = searchParams.get('id');

  // Load Tree Data
  const { data: treeData = [], isLoading: isTreeLoading } = useCategoryTree();

  // Load Detail Data (only if selected)
  const { data: selectedCategory, isLoading: isDetailLoading } = useCategory(
    selectedId || '',
  );

  // Delete hook
  const { mutate: deleteCategory, isPending: isDeletingCategory } =
    useDeleteCategory();

  // Reorder hook
  const { mutate: reorderCategory } = useReorderCategory();

  const handleUpdateUrl = (params: Record<string, string | null>) => {
    const newParams = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(params)) {
      if (value === null || value === '' || value === 'all') {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    }
    router.replace(`${pathname}?${newParams.toString()}`);
  };

  // Filter tree data based on search and status
  const filteredTreeData = (() => {
    if (!search && status === 'all') return treeData;

    const filterNodes = (nodes: typeof treeData): typeof treeData => {
      return nodes
        .map((node) => {
          const matchesSearch = node.name
            .toLowerCase()
            .includes(search.toLowerCase());

          const matchesStatus =
            status === 'all'
              ? true
              : status === 'active'
                ? node.isActive
                : !node.isActive;

          const matches = matchesSearch && matchesStatus;
          const filteredChildren = filterNodes(node.children || []);

          if (matches || filteredChildren.length > 0) {
            return {
              ...node,
              children: filteredChildren,
            };
          }
          return null;
        })
        .filter((node): node is NonNullable<typeof node> => node !== null);
    };

    return filterNodes(treeData);
  })();

  const handleSelectCategory = (id: string) => {
    handleUpdateUrl({ id });
  };

  const handleDelete = (id: string) => {
    deleteCategory(id, {
      onSuccess: () => {
        handleUpdateUrl({ id: null });
      },
    });
  };

  // We don't really use "columns" for the Tree View, but MasterDataPage requires it.
  // We can pass empty array or minimal columns if we were to toggle view modes later.
  const dummyColumns: ColumnDef<CategoryWithRelations>[] = [];

  return (
    <DataListPage<CategoryWithRelations>
      title="Kategori Produk"
      description="Kelola struktur kategori produk Anda."
      createLink="/master-data/categories/create"
      createLabel="Tambah Kategori"
      // Data (Passed but mostly used by renderCustomView)
      data={[]} // Not used in custom view
      columns={dummyColumns}
      isLoading={isTreeLoading}
      // Search & Filters
      search={search}
      onSearchChange={(v) => handleUpdateUrl({ search: v })}
      searchPlaceholder="Cari kategori..."
      filterValues={{ status }}
      onFilterChange={(key, value) => handleUpdateUrl({ [key]: value })}
      onReset={() => router.push(pathname)}
      filters={[
        {
          key: 'status',
          label: 'Status',
          options: [
            { label: 'Aktif', value: 'active' },
            { label: 'Nonaktif', value: 'inactive' },
          ],
          width: 'w-[180px]',
        },
      ]}
      // Pagination - Not used for Tree, but required by props
      page={1}
      pageSize={1000}
      totalPages={1}
      totalItems={treeData.length}
      onPageChange={() => {}}
      onPageSizeChange={() => {}}
      // Custom View
      renderCustomView={() => (
        <div className="flex h-[calc(100vh-14rem)] gap-4 overflow-hidden rounded-lg border bg-background shadow-sm mt-0">
          {/* Left Panel: Tree View */}
          <div className="flex w-1/3 min-w-[300px] flex-col border-r bg-muted/5">
            {/* Search is now in the main Toolbar, so we remove the local search header */}

            <div className="flex-1 overflow-hidden">
              {isTreeLoading ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <CategoriesTree
                  data={filteredTreeData}
                  selectedId={selectedId || undefined}
                  onSelect={handleSelectCategory}
                  onReorder={(id, parentId, index) =>
                    reorderCategory({ id, parentId, index })
                  }
                  className="p-2"
                />
              )}
            </div>
          </div>

          {/* Right Panel: Detail View */}
          <div className="flex-1 overflow-hidden bg-background">
            <CategoryDetail
              category={selectedCategory}
              isLoading={isDetailLoading}
              isDeleting={isDeletingCategory}
              onEdit={(id) => router.push(`/master-data/categories/${id}`)}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}
    />
  );
}

export default function CategoriesPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <CategoriesContent />
    </Suspense>
  );
}
