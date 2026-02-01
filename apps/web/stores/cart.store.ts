import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CartItem {
  id: string; // product id or variant id
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  unit?: string;
  stock?: number; // Available stock for validation
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface CartState {
  items: CartItem[];
  customer: Customer | null;
  heldTransactionId: string | null; // If resuming a held transaction

  // Actions
  addItem: (product: any, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  setCustomer: (customer: Customer | null) => void;
  clearCart: () => void;
  setHeldTransaction: (id: string | null) => void;

  // Getters
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      customer: null,
      heldTransactionId: null,

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

      setCustomer: (customer) => set({ customer }),

      clearCart: () =>
        set({ items: [], customer: null, heldTransactionId: null }),

      setHeldTransaction: (id) => set({ heldTransactionId: id }),

      getTotal: () => {
        const state = get();
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0,
        );
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
        heldTransactionId: state.heldTransactionId,
      }), // select what to persist
    },
  ),
);
