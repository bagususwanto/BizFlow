'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@bizflow/ui';
import { ProductForm } from '@/components/master-data/products/product-form';
import { useBreadcrumb } from '@/contexts/breadcrumb-context';

export default function CreateProductPage() {
  useBreadcrumb('/master-data/products/create', 'Tambah Produk');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">
          Tambah Produk Baru
        </h2>
        <p className="text-muted-foreground">
          Tambahkan produk atau jasa baru ke katalog.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Produk</CardTitle>
          <CardDescription>
            Isi formulir berikut untuk menambahkan produk baru.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  );
}
