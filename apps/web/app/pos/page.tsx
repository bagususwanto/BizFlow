'use client';

import { PosHeader } from '@/components/pos/pos-header';
import { ProductGrid } from '@/components/pos/product-grid';
import { CartSection } from '@/components/pos/cart-section';

export default function PosPage() {
  return (
    <>
      <PosHeader />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-muted/10 p-4 overflow-hidden">
          <ProductGrid />
        </div>
        <div className="w-[30%] min-w-[320px] max-w-[450px] border-l bg-background">
          <CartSection />
        </div>
      </div>
    </>
  );
}
