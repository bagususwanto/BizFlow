'use client';

import { usePosProducts } from '@/hooks/use-pos';
import { useCartStore } from '@/stores/cart.store';
import { Input } from '@bizflow/ui';
import { Button } from '@bizflow/ui';
import { Card, CardContent } from '@bizflow/ui';
import { Search, Package, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@bizflow/ui';
import { Badge } from '@bizflow/ui';
import { cn } from '@bizflow/ui';

// Removed internal search state to lift it up or use props if preferred.
// Actually, if I lift state to PosPage, ProductGrid should accept query and categoryId as props.

interface ProductGridProps {
  categoryId?: string;
  // If we want key based re-mount or plain prop
}

export function ProductGrid({ categoryId }: ProductGridProps) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const { addItem } = useCartStore();

  const { data, isLoading, isError, refetch } = usePosProducts({
    query: debouncedSearch,
    categoryId, // Added this
  });

  const products = data?.data || [];

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari produk (Nama, SKU, Barcode)..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
        </Button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-4 xl:grid-cols-4 2xl:grid-cols-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <p>Gagal memuat produk</p>
            <Button variant="link" onClick={() => refetch()}>
              Coba lagi
            </Button>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
            <Package className="h-12 w-12 mb-2 opacity-50" />
            <p>Tidak ada produk ditemukan</p>
            {debouncedSearch && (
              <p className="text-xs">Kata kunci: "{debouncedSearch}"</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer transition-all hover:bg-accent hover:border-primary/50 active:scale-95"
                onClick={() => addItem({ ...product, price: product.price })}
              >
                <CardContent className="p-3">
                  <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted">
                    {/* Placeholder for image */}
                    {product.imageUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v[0-9]+$/, '')}/uploads/${product.imageUrl}`}
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove(
                            'hidden',
                          );
                        }}
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-xs font-semibold">
                        {(product.name || '?').substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    {/* Fallback for error or empty (image hidden on error, this shows up) */}
                    <div className="hidden h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-xs font-semibold absolute inset-0">
                      {(product.name || '?').substring(0, 2).toUpperCase()}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h3 className="line-clamp-2 text-sm font-medium leading-tight min-h-[2.5em]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-primary">
                        {new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0,
                        }).format(Number(product.price) || 0)}
                      </p>
                      {product.stock !== undefined && (
                        <Badge
                          variant={
                            product.stock > 0 ? 'secondary' : 'destructive'
                          }
                          className="text-[10px] px-1 h-5"
                        >
                          {product.stock}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
