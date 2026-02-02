'use client';

import { PosHeader } from '@/components/pos/pos-header';
import { ProductGrid } from '@/components/pos/product-grid';
import { CartSection } from '@/components/pos/cart-section';
import { CategoryFilter } from '@/components/pos/category-filter';
import { useState } from 'react';

export default function PosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );

  return (
    <>
      <PosHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-muted/10 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 shrink-0">
            <CategoryFilter
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <div className="p-4 flex-1 overflow-hidden">
            <ProductGrid categoryId={selectedCategory} />
          </div>
        </div>
        <div className="w-[30%] min-w-[320px] max-w-[450px] border-l bg-background">
          <CartSection />
        </div>
      </div>
    </>
  );
}
