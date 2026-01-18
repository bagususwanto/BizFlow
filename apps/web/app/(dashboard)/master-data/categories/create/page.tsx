'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { CategoryForm } from '@/components/master-data/categories/category-form';

import { useSearchParams } from 'next/navigation';

export default function CreateCategoryPage() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          Buat Kategori Baru
        </h2>
        <p className="text-muted-foreground">
          Tambahkan kategori produk baru ke dalam sistem.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Formulir Kategori</CardTitle>
          <CardDescription>
            Lengkapi data kategori di bawah ini.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryForm
            initialData={parentId ? ({ parentId } as any) : undefined}
          />
        </CardContent>
      </Card>
    </div>
  );
}
