'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
} from '@bizflow/ui';
import { ShoppingCart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StockAlertItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  minStock: number;
  currentStock: number;
}

interface StockAlertTableProps {
  data: StockAlertItem[];
  isLoading?: boolean;
}

export function StockAlertTable({ data, isLoading }: StockAlertTableProps) {
  const router = useRouter();

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stok</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Tidak ada peringatan stok.
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => {
              const status = getStockStatus(item.currentStock, item.minStock);
              return (
                <TableRow key={item.id}>
                  <TableCell>
                    <StatusBadge status={status} />
                  </TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.sku}</TableCell>
                  <TableCell className="text-right">
                    {item.currentStock} {item.unit}
                  </TableCell>
                  <TableCell className="text-right">{item.minStock}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push('/purchases/orders/create')} // Placeholder PO link
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      PO
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper to determine status based on logic
type StockStatus = 'out_of_stock' | 'critical' | 'low';

function getStockStatus(current: number, min: number): StockStatus {
  if (current <= 0) return 'out_of_stock';
  if (current <= min * 0.5) return 'critical';
  return 'low';
}

function StatusBadge({ status }: { status: StockStatus }) {
  switch (status) {
    case 'out_of_stock':
      return <Badge variant="destructive">Out of Stock</Badge>;
    case 'critical':
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">Critical</Badge>
      );
    case 'low':
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600 text-black">
          Low Stock
        </Badge>
      );
  }
}

function TableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Status</TableHead>
            <TableHead>Produk</TableHead>
            <TableHead>SKU</TableHead>
            <TableHead className="text-right">Stok</TableHead>
            <TableHead className="text-right">Min</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i}>
              <TableCell>
                <div className="h-6 w-20 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-32 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell>
                <div className="h-6 w-24 bg-muted rounded animate-pulse" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-6 w-12 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-6 w-12 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
              <TableCell className="text-right">
                <div className="h-8 w-16 bg-muted rounded animate-pulse ml-auto" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
