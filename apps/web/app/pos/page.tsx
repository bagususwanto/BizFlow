'use client';

import { PosHeader } from '@/components/pos/pos-header';
import { ProductGrid, ProductGridHandle } from '@/components/pos/product-grid';
import { CartSection, CartSectionHandle } from '@/components/pos/cart-section';
import { CategoryFilter } from '@/components/pos/category-filter';
import { useRef, useState } from 'react';
import { HeldTransactionsList } from '@/components/pos/held-transactions-list';
import { useCartStore } from '@/stores/cart.store';
import {
  useResumeTransaction,
  useDeleteHeldTransaction,
} from '@/hooks/use-pos';
import { toast } from 'sonner';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { KeyboardShortcutsDialog } from '@/components/pos/keyboard-shortcuts-dialog';

import { useActivePromotions } from '@/hooks/use-promotions';
import { useEffect } from 'react';

export default function PosPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    undefined,
  );
  const [isHeldListOpen, setIsHeldListOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const setCart = useCartStore((state) => state.setCart);

  // Inject promotions hook
  const { data: promotions } = useActivePromotions();
  const setActivePromotions = useCartStore(
    (state) => state.setActivePromotions,
  );

  // Sync promotions to store
  useEffect(() => {
    if (promotions?.data) {
      setActivePromotions(promotions.data);
    }
  }, [promotions, setActivePromotions]);

  const activeCategoryRef = useRef<string | undefined>(selectedCategory);
  activeCategoryRef.current = selectedCategory;

  const productGridRef = useRef<ProductGridHandle>(null);
  const cartSectionRef = useRef<CartSectionHandle>(null);

  const resumeTransaction = useResumeTransaction();
  const deleteHeldTransaction = useDeleteHeldTransaction();

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onHelp: () => setIsHelpOpen(true),
    onSearchFocus: () => productGridRef.current?.focusSearch(),
    onCustomerClick: () => cartSectionRef.current?.openCustomerSelector(),
    onPayment: () => cartSectionRef.current?.openPaymentModal(),
    onHold: () => cartSectionRef.current?.openHoldDialog(),
    onCancel: () => {
      // Close help if open
      if (isHelpOpen) setIsHelpOpen(false);
      // Additional cancel logic can be added here if needed
    },
  });

  const handleResume = (transaction: any) => {
    // 1. Map items to CartItems
    const cartItems = transaction.items.map((item: any) => ({
      id: item.variantId || item.productId,
      productId: item.productId,
      variantId: item.variantId,
      name: item.productName || item.product?.name || 'Unknown Product', // Backend should return name
      price: Number(item.unitPrice),
      quantity: item.quantity,
      // Optional fields if available
      imageUrl: item.product?.images?.[0]?.url,
      unit: item.unit,
      categoryId: item.product?.category?.id, // Ensure categoryId is captured if available
    }));

    // 2. Set Cart
    setCart(cartItems, transaction.customer || null);

    // 3. Resume (delete from backend held list)
    resumeTransaction.mutate(transaction.id, {
      onSuccess: () => {
        setIsHeldListOpen(false);
        toast.success('Transaksi dilanjutkan');
      },
      onError: () => {
        // Even if backend fails, we have loaded it.
        // But optimally we shouldn't delete if verify fails?
        // Actually resumeHeldTransaction probably just moves state or deletes.
        setIsHeldListOpen(false);
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteHeldTransaction.mutate(id);
  };

  return (
    <>
      <PosHeader
        onOpenHeldList={() => setIsHeldListOpen(true)}
        onHelpClick={() => setIsHelpOpen(true)}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 bg-muted/10 flex flex-col overflow-hidden">
          <div className="px-4 pt-4 shrink-0">
            <CategoryFilter
              selectedId={selectedCategory}
              onSelect={setSelectedCategory}
            />
          </div>
          <div className="p-4 flex-1 overflow-hidden">
            <ProductGrid ref={productGridRef} categoryId={selectedCategory} />
          </div>
        </div>
        <div className="w-[30%] min-w-[320px] max-w-[450px] border-l bg-background">
          <CartSection ref={cartSectionRef} />
        </div>
      </div>

      <HeldTransactionsList
        open={isHeldListOpen}
        onOpenChange={setIsHeldListOpen}
        onResume={handleResume}
        onDelete={handleDelete}
      />
      <KeyboardShortcutsDialog open={isHelpOpen} onOpenChange={setIsHelpOpen} />
    </>
  );
}
