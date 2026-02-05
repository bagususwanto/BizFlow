import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Promotion } from '@/services/promotions.service';

export interface CartItem {
  id: string; // product id or variant id
  productId: string;
  variantId?: string;
  name: string;
  displayName?: string;
  price: number;
  quantity: number;
  unit?: string;
  stock?: number; // Available stock for validation
  imageUrl?: string | null;
  discountPercent?: number;
  discountAmount?: number;
  categoryId?: string;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

export interface Discount {
  type: 'percent' | 'fixed';
  value: number;
}

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  discount: Discount | null;
  heldTransactionId: string | null; // If resuming a held transaction
  activePromotions: Promotion[];

  // Actions
  addItem: (product: any, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setItemDiscount: (
    itemId: string,
    discount: { type: 'percent' | 'fixed'; value: number } | null,
  ) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (discount: Discount | null) => void;
  clearCart: () => void;
  setHeldTransaction: (id: string | null) => void;
  setCart: (
    items: CartItem[],
    customer: Customer | null,
    discount?: Discount | null,
  ) => void;
  setActivePromotions: (promotions: Promotion[]) => void;

  // Getters
  getSubtotal: () => number;
  getTotal: () => number;
  getAppliedPromotion: () => {
    promo: Promotion;
    discountAmount: number;
  } | null;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      discount: null,
      heldTransactionId: null,
      activePromotions: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const itemId = product.variantId || product.id;
          const existingItemIndex = state.items.findIndex(
            (item) => item.id === itemId,
          );

          if (existingItemIndex > -1) {
            // Update existing item
            return {
              items: state.items.map((item, index) =>
                index === existingItemIndex
                  ? { ...item, quantity: item.quantity + quantity }
                  : item,
              ),
            };
          } else {
            // Add new item
            return {
              items: [
                ...state.items,
                {
                  id: itemId,
                  productId: product.productId || product.id,
                  variantId: product.variantId,
                  name: product.name,
                  price: product.price ? Number(product.price) : 0,
                  quantity,
                  unit: product.unit,
                  stock: product.stock,
                  imageUrl: product.imageUrl,
                  categoryId: product.category?.id || product.categoryId,
                },
              ],
            };
          }
        });
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== itemId),
        }));
      },

      updateQuantity: (itemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((item) => item.id !== itemId) };
          }
          return {
            items: state.items.map((item) =>
              item.id === itemId ? { ...item, quantity } : item,
            ),
          };
        });
      },

      setItemDiscount: (itemId, discount) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== itemId) return item;

            if (!discount) {
              const { discountPercent, discountAmount, ...rest } = item;
              return rest;
            }

            return {
              ...item,
              discountPercent:
                discount.type === 'percent' ? discount.value : undefined,
              discountAmount:
                discount.type === 'fixed' ? discount.value : undefined,
            };
          }),
        }));
      },

      setCustomer: (customer) => set({ customer }),

      setDiscount: (discount) => set({ discount }),

      clearCart: () =>
        set({
          items: [],
          customer: null,
          discount: null,
          heldTransactionId: null,
        }),

      setHeldTransaction: (id) => set({ heldTransactionId: id }),

      setCart: (items, customer, discount = null) => {
        set({ items, customer, discount, heldTransactionId: null });
      },

      setActivePromotions: (promotions) =>
        set({ activePromotions: promotions }),

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((total, item) => {
          let itemTotal = item.price * item.quantity;
          if (item.discountPercent) {
            itemTotal -= (itemTotal * item.discountPercent) / 100;
          } else if (item.discountAmount) {
            itemTotal -= item.discountAmount * item.quantity;
          }
          return total + itemTotal;
        }, 0);
      },

      getAppliedPromotion: () => {
        const state = get();
        if (state.discount) return null;

        const subtotal = state.getSubtotal();
        const promos = state.activePromotions || [];

        let bestPromo: Promotion | null = null;
        let maxDiscount = 0;

        for (const promo of promos) {
          if (promo.minPurchase && subtotal < Number(promo.minPurchase)) {
            continue;
          }

          if (promo.applyTo === 'category' || promo.applyTo === 'product') {
            const targetIds = promo.targetIds
              ? JSON.parse(promo.targetIds)
              : [];
            const hasMatch = state.items.some((item) =>
              promo.applyTo === 'category'
                ? targetIds.includes(item.categoryId)
                : targetIds.includes(item.productId),
            );
            if (!hasMatch) continue;
          }

          let discount = 0;
          if (promo.type === 'percentage') {
            discount = (subtotal * Number(promo.value!)) / 100;
            if (promo.maxDiscount) {
              discount = Math.min(discount, Number(promo.maxDiscount));
            }
          } else if (promo.type === 'fixed') {
            discount = Number(promo.value!);
          }

          if (discount > maxDiscount) {
            maxDiscount = discount;
            bestPromo = promo;
          }
        }

        return bestPromo
          ? { promo: bestPromo, discountAmount: maxDiscount }
          : null;
      },

      getTotal: () => {
        const state = get();
        const subtotal = state.getSubtotal();

        if (state.discount) {
          let discountAmount = 0;
          if (state.discount.type === 'percent') {
            discountAmount = (subtotal * state.discount.value) / 100;
          } else {
            discountAmount = state.discount.value;
          }
          return Math.max(0, subtotal - discountAmount);
        }

        const bestPromo = state.getAppliedPromotion();
        if (bestPromo) {
          return Math.max(0, subtotal - bestPromo.discountAmount);
        }

        return subtotal;
      },

      getItemCount: () => {
        const state = get();
        return state.items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: 'bizflow-pos-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        customer: state.customer,
        discount: state.discount,
        heldTransactionId: state.heldTransactionId,
      }),
    },
  ),
);
