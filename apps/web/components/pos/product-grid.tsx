'use client';

import { usePosProducts } from '@/hooks/use-pos';
import { useCartStore } from '@/stores/cart.store';
import { Input } from '@bizflow/ui';
import { Button } from '@bizflow/ui';
import { Card, CardContent } from '@bizflow/ui';
import { Search, Package, RefreshCw } from 'lucide-react';
import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@bizflow/ui';
import { Badge } from '@bizflow/ui';
import { cn } from '@bizflow/ui';
import { useBarcodeScanner } from '@/hooks/use-barcode-scanner';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export interface ProductGridHandle {
  focusSearch: () => void;
}

interface ProductGridProps {
  categoryId?: string;
}

export const ProductGrid = forwardRef<ProductGridHandle, ProductGridProps>(
  ({ categoryId }, ref) => {
    const [search, setSearch] = useState('');
    const debouncedSearch = useDebounce(search, 300);
    const { addItem } = useCartStore();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const t = useTranslations('pos.grid');
    const tCart = useTranslations('pos.cart');

    useImperativeHandle(ref, () => ({
      focusSearch: () => {
        searchInputRef.current?.focus();
      },
    }));

    const { data, isLoading, isError, refetch } = usePosProducts({
      query: debouncedSearch,
      categoryId,
    });

    const products = data?.data || [];

    // Barcode scanner integration for quick sale
    useBarcodeScanner({
      onScan: (barcode) => {
        // Search for product by barcode
        const product = products.find(
          (p) => p.barcode === barcode || p.sku === barcode,
        );

        if (product) {
          // Check if out of stock
          const isService = product.isService;
          const stock = product.stock || 0;
          const isOutOfStock = !isService && stock <= 0;

          if (isOutOfStock) {
            toast.error(`${product.name} habis stok`);
            return;
          }

          // Add to cart
          addItem({ ...product, price: product.price });
          toast.success(`${product.name} ditambahkan ke keranjang`, {
            description: barcode,
          });
        } else {
          // Product not found, try searching
          setSearch(barcode);
          toast.info('Produk tidak ditemukan, mencari...', {
            description: barcode,
          });
        }
      },
      minLength: 3, // Minimum barcode length
      timeThreshold: 50, // Fast typing detection for scanner
    });

    return (
      <div className="flex h-full flex-col gap-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              placeholder={t('searchPlaceholder')}
              className="pl-9 pr-12"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            <div className="absolute right-2 top-2.5 pointer-events-none hidden sm:block">
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                F2
              </kbd>
            </div>
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
              <p>{t('noProducts')}</p>
              {debouncedSearch ? (
                <p className="text-xs">Kata kunci: "{debouncedSearch}"</p>
              ) : (
                <p className="text-xs">{t('noProductsDesc')}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {products.map((product) => {
                const isService = product.isService;
                const stock = product.stock || 0;
                const isOutOfStock = !isService && stock <= 0;

                return (
                  <Card
                    key={product.id}
                    className={cn(
                      'transition-all',
                      isOutOfStock
                        ? 'opacity-50 cursor-not-allowed bg-muted'
                        : 'cursor-pointer hover:bg-accent hover:border-primary/50 active:scale-95',
                    )}
                    onClick={() => {
                      if (!isOutOfStock) {
                        addItem({ ...product, price: product.price });
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="mb-2 aspect-square w-full overflow-hidden rounded-md bg-muted relative">
                        {/* Placeholder for image */}
                        {product.imageUrl ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v[0-9]+$/, '')}/uploads/${product.imageUrl}`}
                            alt={product.name}
                            className={cn(
                              'h-full w-full object-cover',
                              isOutOfStock && 'grayscale',
                            )}
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove(
                                'hidden',
                              );
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-xs font-semibold">
                            {(product.name || '?')
                              .substring(0, 2)
                              .toUpperCase()}
                          </div>
                        )}

                        {/* Fallback for error or empty */}
                        <div className="hidden h-full w-full items-center justify-center bg-secondary text-secondary-foreground text-xs font-semibold absolute inset-0">
                          {(product.name || '?').substring(0, 2).toUpperCase()}
                        </div>

                        {/* Out of Stock Overlay */}
                        {isOutOfStock && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
                            <Badge
                              variant="destructive"
                              className="font-bold border-2 border-background shadow-sm"
                            >
                              HABIS
                            </Badge>
                          </div>
                        )}
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
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  },
);

ProductGrid.displayName = 'ProductGrid';
