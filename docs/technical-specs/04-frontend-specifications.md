# Frontend Specifications

## Page Routes

```typescript
// app/ directory structure (Next.js App Router)

// Authentication
/login                              // Login page
/forgot-password                    // Password recovery

// Dashboard
/                                   // Redirect to /dashboard
/dashboard                          // Main dashboard

// POS (Full-screen mode)
/pos                                // POS main screen

// Master Data
/master-data/products               // Product list
/master-data/products/new           // Create product
/master-data/products/[id]          // Edit product
/master-data/categories             // Category management
/master-data/categories/[id]        // Edit category
/master-data/units                  // Unit management
/master-data/customers              // Customer list
/master-data/customers/new          // Create customer
/master-data/customers/[id]         // Customer detail
/master-data/suppliers              // Supplier list
/master-data/suppliers/new          // Create supplier
/master-data/suppliers/[id]         // Supplier detail
/master-data/warehouses             // Warehouse management
/master-data/warehouses/[id]        // Warehouse detail

// Inventory
/inventory/stock                    // Stock overview
/inventory/adjustments              // Stock adjustment list
/inventory/adjustments/new          // Create adjustment
/inventory/adjustments/[id]         // Adjustment detail
/inventory/transfers                // Stock transfer list
/inventory/transfers/new            // Create transfer
/inventory/transfers/[id]           // Transfer detail
/inventory/opname                   // Stock opname list
/inventory/opname/new               // Start opname
/inventory/opname/[id]              // Opname detail

// Sales
/sales/orders                       // Sales order list
/sales/orders/new                   // Create order
/sales/orders/[id]                  // Order detail
/sales/returns                      // Sales return list
/sales/returns/[id]                 // Return detail
/sales/payments                     // Customer payment list
/sales/payments/new                 // Record payment

// Purchases
/purchases/orders                   // PO list
/purchases/orders/new               // Create PO
/purchases/orders/[id]              // PO detail
/purchases/goods-receive            // Goods receive list
/purchases/goods-receive/new        // Create goods receive
/purchases/goods-receive/[id]       // Goods receive detail
/purchases/returns                  // Purchase return list
/purchases/returns/[id]             // Return detail
/purchases/payments                 // Supplier payment list
/purchases/payments/new             // Record payment

// Finance
/finance/accounts                   // Account list
/finance/accounts/[id]              // Account detail
/finance/transactions               // All transactions
/finance/transactions/new           // Record income/expense
/finance/expenses                   // Expense categories

// Reports
/reports                            // Report dashboard
/reports/sales                      // Sales report
/reports/sales/by-product           // Sales by product
/reports/sales/by-customer          // Sales by customer
/reports/inventory                  // Inventory report
/reports/inventory/valuation        // Stock valuation
/reports/financial                  // P&L and cash flow
/reports/financial/profit-loss      // Profit & Loss
/reports/financial/cash-flow        // Cash flow report

// Settings
/settings                           // Settings overview
/settings/general                   // General app settings
/settings/users                     // User management
/settings/users/new                 // Create user
/settings/users/[id]                // Edit user
/settings/roles                     // Role management
/settings/roles/new                 // Create role
/settings/roles/[id]                // Edit role
/settings/outlets                   // Outlet management
/settings/outlets/[id]              // Edit outlet
/settings/printer                   // Printer config
/settings/backup                    // Backup/restore
```

---

## State Management

### Auth Store (Zustand)

```typescript
// stores/auth.store.ts
interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
}
```

### POS Store (Zustand)

```typescript
// stores/pos.store.ts
interface POSState {
  cart: CartItem[];
  customer: Customer | null;
  discount: { percent: number; amount: number };
  payments: Payment[];
  heldTransactions: HeldTransaction[];

  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  setCustomer: (customer: Customer | null) => void;
  setDiscount: (discount: Discount) => void;
  addPayment: (payment: Payment) => void;
  holdTransaction: () => void;
  resumeTransaction: (id: string) => void;
  clearCart: () => void;
  processTransaction: () => Promise<TransactionResult>;
}
```

### TanStack Query Hooks

```typescript
// hooks/api/use-products.ts
const useProducts = (params: ProductListQuery) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productService.list(params),
  });
};

const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// hooks/api/use-customers.ts
const useCustomers = (params: CustomerListQuery) => {
  return useQuery({
    queryKey: ['customers', params],
    queryFn: () => customerService.list(params),
  });
};

// hooks/api/use-inventory.ts
const useStock = (params: StockQuery) => {
  return useQuery({
    queryKey: ['stock', params],
    queryFn: () => inventoryService.getStock(params),
  });
};

// hooks/api/use-reports.ts
const useDashboard = () => {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => reportService.getDashboard(),
    refetchInterval: 60000, // Refresh every minute
  });
};
```

---

## Offline Support (PWA)

```typescript
// Service Worker strategy
const cacheStrategies = {
  // Static assets: Cache First
  static: {
    routes: ['/fonts', '/images', '/icons'],
    strategy: 'CacheFirst',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // API responses: Network First with fallback
  api: {
    routes: ['/api/v1/products', '/api/v1/categories'],
    strategy: 'NetworkFirst',
    timeout: 3000,
  },

  // Critical: Stale While Revalidate
  app: {
    routes: ['/_next', '/pos'],
    strategy: 'StaleWhileRevalidate',
  },
};

// IndexedDB for offline data
interface OfflineStore {
  products: Product[]; // Cached products
  customers: Customer[]; // Cached customers
  pendingTransactions: POSTransaction[]; // Offline transactions
  syncQueue: SyncJob[]; // Pending sync jobs
}
```

---

## Keyboard Shortcuts (POS)

| Shortcut  | Action                        |
| --------- | ----------------------------- |
| `F1`      | Open help                     |
| `F2`      | Search product                |
| `F3`      | Search customer               |
| `F4`      | Apply discount                |
| `F5`      | Hold transaction              |
| `F6`      | Resume held transaction       |
| `F7`      | Print last receipt            |
| `F8`      | Cash payment                  |
| `F9`      | QRIS payment                  |
| `F10`     | Process transaction           |
| `F12`     | Cancel transaction            |
| `+` / `-` | Increase/decrease quantity    |
| `Del`     | Remove item                   |
| `Esc`     | Clear selection / Close modal |

---

## Component Structure

```
components/
├── ui/                     # Shadcn/UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/
│   ├── app-sidebar.tsx
│   ├── header.tsx
│   └── page-header.tsx
├── data-table/
│   ├── data-table.tsx
│   ├── columns.tsx
│   └── pagination.tsx
├── forms/
│   ├── product-form.tsx
│   ├── customer-form.tsx
│   ├── order-form.tsx
│   └── ...
├── pos/
│   ├── cart.tsx
│   ├── product-grid.tsx
│   ├── payment-modal.tsx
│   └── receipt-preview.tsx
├── reports/
│   ├── sales-chart.tsx
│   ├── inventory-table.tsx
│   └── dashboard-cards.tsx
└── shared/
    ├── search-input.tsx
    ├── date-range-picker.tsx
    ├── currency-input.tsx
    └── barcode-scanner.tsx
```
