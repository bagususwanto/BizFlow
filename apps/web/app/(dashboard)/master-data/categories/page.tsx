'use client';

import { Suspense, useCallback, useState } from 'react';
import { Button, Input } from '@bizflow/ui';
import { Plus, Loader2, Search } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import {
  useCategoryTree,
  useCategory,
  useDeleteCategory,
  useReorderCategory,
} from '@/hooks/use-categories';
import {
  CategoriesTree,
  CategoryDetail,
} from '@/components/master-data/categories';

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get state from URL params
  const search = searchParams.get('search') || '';
  const selectedId = searchParams.get('id');

  // Load Tree Data
  const { data: treeData = [], isLoading: isTreeLoading } = useCategoryTree();

  // Load Detail Data (only if selected)
  const { data: selectedCategory, isLoading: isDetailLoading } = useCategory(
    selectedId || '',
  );

  // Delete hook
  const { mutate: deleteCategory } = useDeleteCategory();

  // Reorder hook
  const { mutate: reorderCategory } = useReorderCategory();

  // Filter tree data based on search
  const filteredTreeData = (() => {
    if (!search) return treeData;

    const filterNodes = (nodes: typeof treeData): typeof treeData => {
      return nodes
        .map((node) => {
          const matches = node.name
            .toLowerCase()
            .includes(search.toLowerCase());
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
    const params = new URLSearchParams(searchParams.toString());
    params.set('id', id);
    router.push(`/master-data/categories?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    router.replace(`/master-data/categories?${params.toString()}`);
  };

  const handleEdit = (id: string) => {
    router.push(`/master-data/categories/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      deleteCategory(id, {
        onSuccess: () => {
          // Clear selection if deleted
          const params = new URLSearchParams(searchParams.toString());
          params.delete('id');
          router.replace(`/master-data/categories?${params.toString()}`);
        },
      });
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Kategori Produk</h2>
          <p className="text-sm text-muted-foreground">
            Kelola struktur kategori produk Anda.
          </p>
        </div>
        <Button asChild>
          <Link href="/master-data/categories/create">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kategori
          </Link>
        </Button>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden rounded-lg border bg-background shadow-sm">
        {/* Left Panel: Tree View */}
        <div className="flex w-1/3 min-w-[300px] flex-col border-r bg-muted/5">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari kategori..."
                className="w-full bg-background pl-9"
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
          </div>

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
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
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
