# Frontend Specifications

## Page Routes

```typescript
// app/ directory structure (Next.js App Router)

// Authentication
/login                        // Login page
/forgot-password              // Password recovery

// Dashboard
/                             // Dashboard/home
/dashboard                    // Alternative dashboard route

// POS
/pos                          // POS main screen
/pos/transactions             // Transaction history
/pos/transactions/[id]        // Transaction detail
/pos/returns                  // Return/refund

// Products
/products                     // Product list
/products/new                 // Create product
/products/[id]                // Edit product
/products/categories          // Category management
/products/units               // Unit management

// Sales
/sales/orders                 // Sales order list
/sales/orders/new             // Create order
/sales/orders/[id]            // Order detail
/sales/returns                // Sales return list
/sales/customers              // Customer list
/sales/customers/new          // Create customer
/sales/customers/[id]         // Customer detail

// Purchases
/purchases/orders             // PO list
/purchases/orders/new         // Create PO
/purchases/orders/[id]        // PO detail
/purchases/receive            // Goods receive list
/purchases/receive/new        // Create goods receive
/purchases/returns            // Purchase return list
/purchases/suppliers          // Supplier list
/purchases/suppliers/new      // Create supplier
/purchases/suppliers/[id]     // Supplier detail

// Inventory
/inventory                    // Stock overview
/inventory/adjustments        // Stock adjustment list
/inventory/adjustments/new    // Create adjustment
/inventory/adjustments/[id]   // Adjustment detail
/inventory/transfers          // Stock transfer list
/inventory/transfers/new      // Create transfer
/inventory/transfers/[id]     // Transfer detail
/inventory/opname             // Stock opname list
/inventory/opname/new         // Start opname
/inventory/opname/[id]        // Opname detail
/inventory/warehouses         // Warehouse management

// Finance
/finance/accounts             // Account list
/finance/accounts/[id]        // Account detail
/finance/cash-flow            // Cash flow overview
/finance/transactions         // All transactions
/finance/transactions/new     // Record income/expense
/finance/receivables          // Account receivables (AR)
/finance/payables             // Account payables (AP)
/finance/expense-categories   // Expense category management

// Reports
/reports                      // Report dashboard
/reports/sales                // Sales report
/reports/sales/by-product     // Sales by product
/reports/sales/by-customer    // Sales by customer
/reports/purchases            // Purchase report
/reports/purchases/by-supplier // Purchases by supplier
/reports/inventory            // Inventory report
/reports/inventory/valuation  // Stock valuation
/reports/profit-loss          // P&L
/reports/cash-flow            // Cash flow report
/reports/ar                   // Receivables aging
/reports/ap                   // Payables aging

// Settings
/settings                     // Settings overview
/settings/users               // User management
/settings/users/new           // Create user
/settings/users/[id]          // Edit user
/settings/roles               // Role management
/settings/roles/new           // Create role
/settings/roles/[id]          // Edit role
/settings/outlets             // Outlet management
/settings/company             // Company info
/settings/printer             // Printer config
/settings/backup              // Backup/restore
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
    queryKey: ["products", params],
    queryFn: () => productService.list(params),
  });
};

const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: productService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// hooks/api/use-customers.ts
const useCustomers = (params: CustomerListQuery) => {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customerService.list(params),
  });
};

// hooks/api/use-inventory.ts
const useStock = (params: StockQuery) => {
  return useQuery({
    queryKey: ["stock", params],
    queryFn: () => inventoryService.getStock(params),
  });
};

// hooks/api/use-reports.ts
const useDashboard = () => {
  return useQuery({
    queryKey: ["dashboard"],
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
    routes: ["/fonts", "/images", "/icons"],
    strategy: "CacheFirst",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // API responses: Network First with fallback
  api: {
    routes: ["/api/v1/products", "/api/v1/categories"],
    strategy: "NetworkFirst",
    timeout: 3000,
  },

  // Critical: Stale While Revalidate
  app: {
    routes: ["/_next", "/pos"],
    strategy: "StaleWhileRevalidate",
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
