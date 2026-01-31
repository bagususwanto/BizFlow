'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { CategoryForm } from '@/components/master-data/categories/category-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

function CreateCategoryContent() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId');

  return (
    <CategoryForm initialData={parentId ? ({ parentId } as any) : undefined} />
  );
}

export default function CreateCategoryPage() {
  useBreadcrumb('/master-data/categories/create', 'Tambah Kategori');

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
          <Suspense
            fallback={
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <CreateCategoryContent />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
