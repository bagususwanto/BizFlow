'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@bizflow/ui';
import { WarehouseForm } from '@/components/master-data/warehouses/warehouse-form';

export default function CreateWarehousePage() {
  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/master-data/warehouses">
              Gudang
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tambah Gudang</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tambah Gudang</h2>
          <p className="text-muted-foreground">
            Buat data gudang baru untuk penyimpanan stok.
          </p>
        </div>
      </div>

      <WarehouseForm />
    </div>
  );
}
