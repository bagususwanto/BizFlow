'use client';

import { use } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { Loader2 } from 'lucide-react';
import { useCategory } from '@/hooks/use-categories';
import { CategoryForm } from '@/components/master-data/categories/category-form';

export default function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: category, isLoading, isError } = useCategory(id);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-red-500">
        Gagal memuat data kategori
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Edit Kategori</h2>
        <p className="text-muted-foreground">
          Ubah informasi kategori {category.name}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Edit Kategori</CardTitle>
          <CardDescription>
            Silakan ubah data kategori di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm initialData={category} isEdit />
        </CardContent>
      </Card>
    </div>
  );
}
