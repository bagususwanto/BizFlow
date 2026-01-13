# API Specifications

## Design Principles

| Aspek              | Standard                 |
| ------------------ | ------------------------ |
| **Style**          | RESTful                  |
| **Format**         | JSON                     |
| **Versioning**     | URL path (`/api/v1/...`) |
| **Authentication** | JWT Bearer Token         |
| **Error Format**   | RFC 7807 Problem Details |

---

## 1. Authentication

### POST `/api/v1/auth/login`

```typescript
// Request
interface LoginRequest {
  username: string;
  password: string;
}

// Response
interface LoginResponse {
  accessToken: string; // expires in 15 minutes
  refreshToken: string; // expires in 7 days
  user: {
    id: string;
    username: string;
    name: string;
    role: string;
    permissions: string[];
  };
}
```

### POST `/api/v1/auth/refresh`

```typescript
interface RefreshRequest {
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}
```

### POST `/api/v1/auth/logout`

```typescript
// Request: Authorization header with Bearer token
// Response: 204 No Content
```

### POST `/api/v1/auth/pin-login`

```typescript
interface PinLoginRequest {
  userId: string;
  pin: string;
}
// Response: same as LoginResponse
```

---

## 2. Users & Roles

### Users

| Method | Endpoint                     | Description            |
| ------ | ---------------------------- | ---------------------- |
| GET    | `/api/v1/users`              | List users (paginated) |
| GET    | `/api/v1/users/:id`          | Get user detail        |
| POST   | `/api/v1/users`              | Create user            |
| PATCH  | `/api/v1/users/:id`          | Update user            |
| DELETE | `/api/v1/users/:id`          | Deactivate user        |
| PATCH  | `/api/v1/users/:id/password` | Change password        |
| PATCH  | `/api/v1/users/:id/pin`      | Set/change PIN         |

```typescript
interface CreateUserRequest {
  username: string;
  email?: string;
  password: string;
  name: string;
  roleId: string;
  outletIds?: string[];
}

interface UserResponse {
  id: string;
  username: string;
  email: string | null;
  name: string;
  role: { id: string; name: string };
  outlets: { id: string; name: string }[];
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}
```

### Roles & Permissions

| Method | Endpoint              | Description                    |
| ------ | --------------------- | ------------------------------ |
| GET    | `/api/v1/roles`       | List roles                     |
| GET    | `/api/v1/roles/:id`   | Get role with permissions      |
| POST   | `/api/v1/roles`       | Create role                    |
| PATCH  | `/api/v1/roles/:id`   | Update role                    |
| DELETE | `/api/v1/roles/:id`   | Delete role                    |
| GET    | `/api/v1/permissions` | List all available permissions |

```typescript
interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: {
    module: string;
    actions: string[];
  }[];
}
```

### Audit Logs

| Method | Endpoint             | Description                             |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/api/v1/audit-logs` | List audit logs (paginated, filterable) |

```typescript
interface AuditLogQuery {
  userId?: string;
  module?: string;
  action?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
```

---

## 3. Products

### Products

| Method | Endpoint                                   | Description                           |
| ------ | ------------------------------------------ | ------------------------------------- |
| GET    | `/api/v1/products`                         | List products (paginated, filterable) |
| GET    | `/api/v1/products/:id`                     | Get product detail with variants      |
| POST   | `/api/v1/products`                         | Create product                        |
| PATCH  | `/api/v1/products/:id`                     | Update product                        |
| DELETE | `/api/v1/products/:id`                     | Soft delete product                   |
| GET    | `/api/v1/products/search`                  | Quick search by barcode/SKU/name      |
| POST   | `/api/v1/products/:id/variants`            | Add variant                           |
| PATCH  | `/api/v1/products/:id/variants/:variantId` | Update variant                        |
| DELETE | `/api/v1/products/:id/variants/:variantId` | Delete variant                        |

```typescript
interface ProductListQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  isActive?: boolean;
  isService?: boolean;
  minStock?: boolean; // Filter products below min stock
  sortBy?: 'name' | 'sku' | 'createdAt' | 'sellPrice' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

interface CreateProductRequest {
  sku: string;
  barcode?: string;
  name: string;
  description?: string;
  categoryId: string;
  unitId: string;
  costPrice: number;
  sellPrice: number;
  minStock?: number;
  isService?: boolean;
  imageUrl?: string;
  variants?: CreateVariantRequest[];
  priceLevels?: CreatePriceLevelRequest[];
}

interface CreateVariantRequest {
  sku: string;
  barcode?: string;
  name: string;
  attributes: Record<string, string>;
  costPrice: number;
  sellPrice: number;
}

interface CreatePriceLevelRequest {
  name: string;
  minQty: number;
  price: number;
}

interface ProductResponse {
  id: string;
  sku: string;
  barcode: string | null;
  name: string;
  description: string | null;
  category: { id: string; name: string };
  unit: { id: string; name: string; symbol: string };
  costPrice: number;
  sellPrice: number;
  minStock: number;
  currentStock: number;
  isActive: boolean;
  isService: boolean;
  imageUrl: string | null;
  variants: VariantResponse[];
  priceLevels: PriceLevelResponse[];
  createdAt: string;
  updatedAt: string;
}
```

### Categories

| Method | Endpoint                 | Description                      |
| ------ | ------------------------ | -------------------------------- |
| GET    | `/api/v1/categories`     | List categories (tree structure) |
| GET    | `/api/v1/categories/:id` | Get category detail              |
| POST   | `/api/v1/categories`     | Create category                  |
| PATCH  | `/api/v1/categories/:id` | Update category                  |
| DELETE | `/api/v1/categories/:id` | Delete category                  |

```typescript
interface CreateCategoryRequest {
  name: string;
  parentId?: string;
  description?: string;
}

interface CategoryTreeResponse {
  id: string;
  name: string;
  description: string | null;
  productCount: number;
  children: CategoryTreeResponse[];
}
```

### Units of Measure

| Method | Endpoint            | Description |
| ------ | ------------------- | ----------- |
| GET    | `/api/v1/units`     | List units  |
| POST   | `/api/v1/units`     | Create unit |
| PATCH  | `/api/v1/units/:id` | Update unit |
| DELETE | `/api/v1/units/:id` | Delete unit |

```typescript
interface CreateUnitRequest {
  name: string;
  symbol: string;
  baseUnitId?: string;
  conversionRate?: number;
}
```

---

## 4. Point of Sale (POS)

| Method | Endpoint                               | Description                |
| ------ | -------------------------------------- | -------------------------- |
| POST   | `/api/v1/pos/transaction`              | Create POS transaction     |
| GET    | `/api/v1/pos/transactions`             | List POS transactions      |
| GET    | `/api/v1/pos/transactions/:id`         | Get transaction detail     |
| GET    | `/api/v1/pos/transactions/:id/receipt` | Get receipt PDF/print data |
| POST   | `/api/v1/pos/hold`                     | Hold current transaction   |
| GET    | `/api/v1/pos/held`                     | Get held transactions      |
| POST   | `/api/v1/pos/held/:id/resume`          | Resume held transaction    |
| DELETE | `/api/v1/pos/held/:id`                 | Cancel held transaction    |
| POST   | `/api/v1/pos/return`                   | Process return/refund      |

```typescript
interface CreatePOSTransactionRequest {
  items: {
    variantId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    discountAmount?: number;
    notes?: string;
  }[];
  customerId?: string;
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  payments: {
    method: 'cash' | 'qris' | 'transfer' | 'credit';
    amount: number;
    accountId: string;
    reference?: string;
  }[];
  notes?: string;
}

interface POSTransactionResponse {
  id: string;
  orderNumber: string;
  customer: CustomerSummary | null;
  items: POSItemResponse[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  payments: PaymentResponse[];
  paidAmount: number;
  change: number;
  cashier: { id: string; name: string };
  createdAt: string;
}

interface HoldTransactionRequest {
  items: POSItemRequest[];
  customerId?: string;
  discountPercent?: number;
  discountAmount?: number;
  notes?: string;
}

interface ReturnRequest {
  originalOrderId: string;
  items: {
    orderItemId: string;
    quantity: number;
    reason: string;
  }[];
  refundMethod: 'cash' | 'credit';
  accountId: string;
}
```

---

## 5. Sales Management

### Customers

| Method | Endpoint                             | Description                  |
| ------ | ------------------------------------ | ---------------------------- |
| GET    | `/api/v1/customers`                  | List customers               |
| GET    | `/api/v1/customers/:id`              | Get customer detail          |
| POST   | `/api/v1/customers`                  | Create customer              |
| PATCH  | `/api/v1/customers/:id`              | Update customer              |
| DELETE | `/api/v1/customers/:id`              | Deactivate customer          |
| GET    | `/api/v1/customers/:id/transactions` | Customer transaction history |
| GET    | `/api/v1/customers/:id/balance`      | Customer credit balance      |

```typescript
interface CreateCustomerRequest {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  creditLimit?: number;
  priceLevelId?: string;
}

interface CustomerResponse {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
  creditLimit: number;
  currentBalance: number; // Outstanding receivables
  priceLevel: { id: string; name: string } | null;
  isActive: boolean;
  totalTransactions: number;
  totalSpent: number;
  createdAt: string;
}
```

### Sales Orders

| Method | Endpoint                            | Description           |
| ------ | ----------------------------------- | --------------------- |
| GET    | `/api/v1/sales/orders`              | List sales orders     |
| GET    | `/api/v1/sales/orders/:id`          | Get order detail      |
| POST   | `/api/v1/sales/orders`              | Create sales order    |
| PATCH  | `/api/v1/sales/orders/:id`          | Update order          |
| POST   | `/api/v1/sales/orders/:id/confirm`  | Confirm order         |
| POST   | `/api/v1/sales/orders/:id/cancel`   | Cancel order          |
| POST   | `/api/v1/sales/orders/:id/delivery` | Create delivery order |

```typescript
interface SalesOrderQuery {
  page?: number;
  limit?: number;
  customerId?: string;
  status?: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  startDate?: string;
  endDate?: string;
  search?: string; // Order number
}

interface CreateSalesOrderRequest {
  customerId?: string;
  dueDate?: string;
  items: {
    variantId: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    discountAmount?: number;
  }[];
  discountPercent?: number;
  discountAmount?: number;
  taxPercent?: number;
  notes?: string;
}
```

### Sales Returns

| Method | Endpoint                            | Description         |
| ------ | ----------------------------------- | ------------------- |
| GET    | `/api/v1/sales/returns`             | List sales returns  |
| GET    | `/api/v1/sales/returns/:id`         | Get return detail   |
| POST   | `/api/v1/sales/returns`             | Create sales return |
| POST   | `/api/v1/sales/returns/:id/approve` | Approve return      |

---

## 6. Purchase Management

### Suppliers

| Method | Endpoint                       | Description            |
| ------ | ------------------------------ | ---------------------- |
| GET    | `/api/v1/suppliers`            | List suppliers         |
| GET    | `/api/v1/suppliers/:id`        | Get supplier detail    |
| POST   | `/api/v1/suppliers`            | Create supplier        |
| PATCH  | `/api/v1/suppliers/:id`        | Update supplier        |
| DELETE | `/api/v1/suppliers/:id`        | Deactivate supplier    |
| GET    | `/api/v1/suppliers/:id/orders` | Supplier order history |

```typescript
interface CreateSupplierRequest {
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  paymentTermDays?: number;
  bankName?: string;
  bankAccount?: string;
}

interface SupplierResponse {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  taxId: string | null;
  paymentTermDays: number;
  currentBalance: number; // Outstanding payables
  isActive: boolean;
  createdAt: string;
}
```

### Purchase Orders

| Method | Endpoint                               | Description          |
| ------ | -------------------------------------- | -------------------- |
| GET    | `/api/v1/purchases/orders`             | List purchase orders |
| GET    | `/api/v1/purchases/orders/:id`         | Get PO detail        |
| POST   | `/api/v1/purchases/orders`             | Create PO            |
| PATCH  | `/api/v1/purchases/orders/:id`         | Update PO            |
| POST   | `/api/v1/purchases/orders/:id/confirm` | Confirm PO           |
| POST   | `/api/v1/purchases/orders/:id/cancel`  | Cancel PO            |

```typescript
interface CreatePurchaseOrderRequest {
  supplierId: string;
  expectedDate?: string;
  items: {
    variantId: string;
    quantity: number;
    unitPrice: number;
  }[];
  notes?: string;
}
```

### Goods Receive

| Method | Endpoint                         | Description          |
| ------ | -------------------------------- | -------------------- |
| GET    | `/api/v1/purchases/receives`     | List goods receives  |
| GET    | `/api/v1/purchases/receives/:id` | Get receive detail   |
| POST   | `/api/v1/purchases/receives`     | Create goods receive |

```typescript
interface CreateGoodsReceiveRequest {
  purchaseOrderId: string;
  warehouseId: string;
  items: {
    purchaseOrderItemId: string;
    receivedQuantity: number;
    notes?: string;
  }[];
  notes?: string;
}
```

### Purchase Returns

| Method | Endpoint                    | Description            |
| ------ | --------------------------- | ---------------------- |
| GET    | `/api/v1/purchases/returns` | List purchase returns  |
| POST   | `/api/v1/purchases/returns` | Create purchase return |

---

## 7. Inventory Management

### Stock

| Method | Endpoint                                       | Description                |
| ------ | ---------------------------------------------- | -------------------------- |
| GET    | `/api/v1/inventory/stock`                      | Stock overview (paginated) |
| GET    | `/api/v1/inventory/stock/:variantId`           | Stock per variant          |
| GET    | `/api/v1/inventory/stock/:variantId/movements` | Stock movement history     |
| GET    | `/api/v1/inventory/low-stock`                  | Products below min stock   |
| GET    | `/api/v1/inventory/expiring`                   | Products near expiry       |

```typescript
interface StockQuery {
  page?: number;
  limit?: number;
  warehouseId?: string;
  categoryId?: string;
  search?: string;
  belowMinStock?: boolean;
  sortBy?: 'name' | 'quantity' | 'value';
  sortOrder?: 'asc' | 'desc';
}

interface StockResponse {
  id: string;
  product: { id: string; sku: string; name: string };
  variant: { id: string; sku: string; name: string } | null;
  warehouse: { id: string; name: string };
  quantity: number;
  reservedQty: number;
  availableQty: number;
  minStock: number;
  value: number; // quantity * cost price
}
```

### Stock Adjustments

| Method | Endpoint                                    | Description           |
| ------ | ------------------------------------------- | --------------------- |
| GET    | `/api/v1/inventory/adjustments`             | List adjustments      |
| GET    | `/api/v1/inventory/adjustments/:id`         | Get adjustment detail |
| POST   | `/api/v1/inventory/adjustments`             | Create adjustment     |
| POST   | `/api/v1/inventory/adjustments/:id/approve` | Approve adjustment    |

```typescript
interface CreateAdjustmentRequest {
  warehouseId: string;
  type: 'increase' | 'decrease' | 'correction';
  reason: string;
  items: {
    variantId: string;
    quantity: number; // Positive for increase, negative for decrease
    notes?: string;
  }[];
  notes?: string;
}
```

### Stock Transfers

| Method | Endpoint                                  | Description         |
| ------ | ----------------------------------------- | ------------------- |
| GET    | `/api/v1/inventory/transfers`             | List transfers      |
| GET    | `/api/v1/inventory/transfers/:id`         | Get transfer detail |
| POST   | `/api/v1/inventory/transfers`             | Create transfer     |
| POST   | `/api/v1/inventory/transfers/:id/send`    | Mark as sent        |
| POST   | `/api/v1/inventory/transfers/:id/receive` | Mark as received    |

```typescript
interface CreateTransferRequest {
  fromWarehouseId: string;
  toWarehouseId: string;
  items: {
    variantId: string;
    quantity: number;
  }[];
  notes?: string;
}
```

### Stock Opname

| Method | Endpoint                                | Description                     |
| ------ | --------------------------------------- | ------------------------------- |
| GET    | `/api/v1/inventory/opname`              | List stock opname sessions      |
| GET    | `/api/v1/inventory/opname/:id`          | Get opname detail               |
| POST   | `/api/v1/inventory/opname`              | Start opname session            |
| PATCH  | `/api/v1/inventory/opname/:id`          | Update opname counts            |
| POST   | `/api/v1/inventory/opname/:id/finalize` | Finalize and create adjustments |

```typescript
interface CreateOpnameRequest {
  warehouseId: string;
  categoryId?: string; // Optional: only count specific category
  notes?: string;
}

interface UpdateOpnameRequest {
  items: {
    variantId: string;
    countedQuantity: number;
    notes?: string;
  }[];
}
```

### Warehouses

| Method | Endpoint                 | Description          |
| ------ | ------------------------ | -------------------- |
| GET    | `/api/v1/warehouses`     | List warehouses      |
| GET    | `/api/v1/warehouses/:id` | Get warehouse detail |
| POST   | `/api/v1/warehouses`     | Create warehouse     |
| PATCH  | `/api/v1/warehouses/:id` | Update warehouse     |
| DELETE | `/api/v1/warehouses/:id` | Deactivate warehouse |

---

## 8. Cash & Bank Management

### Accounts

| Method | Endpoint                                    | Description                     |
| ------ | ------------------------------------------- | ------------------------------- |
| GET    | `/api/v1/finance/accounts`                  | List accounts                   |
| GET    | `/api/v1/finance/accounts/:id`              | Get account detail with balance |
| POST   | `/api/v1/finance/accounts`                  | Create account                  |
| PATCH  | `/api/v1/finance/accounts/:id`              | Update account                  |
| GET    | `/api/v1/finance/accounts/:id/transactions` | Account transaction history     |

```typescript
interface CreateAccountRequest {
  code: string;
  name: string;
  type: 'cash' | 'bank' | 'receivable' | 'payable';
  bankName?: string;
  accountNumber?: string;
  initialBalance?: number;
}

interface AccountResponse {
  id: string;
  code: string;
  name: string;
  type: string;
  bankName: string | null;
  accountNumber: string | null;
  balance: number;
  isActive: boolean;
}
```

### Transactions

| Method | Endpoint                           | Description               |
| ------ | ---------------------------------- | ------------------------- |
| GET    | `/api/v1/finance/transactions`     | List all transactions     |
| GET    | `/api/v1/finance/transactions/:id` | Get transaction detail    |
| POST   | `/api/v1/finance/income`           | Record income             |
| POST   | `/api/v1/finance/expense`          | Record expense            |
| POST   | `/api/v1/finance/transfer`         | Transfer between accounts |

```typescript
interface TransactionQuery {
  page?: number;
  limit?: number;
  accountId?: string;
  categoryId?: string;
  type?: 'income' | 'expense' | 'transfer';
  startDate?: string;
  endDate?: string;
}

interface CreateIncomeRequest {
  accountId: string;
  amount: number;
  transactionDate?: string;
  description: string;
  categoryId?: string;
  referenceType?: string;
  referenceId?: string;
}

interface CreateExpenseRequest {
  accountId: string;
  categoryId: string;
  amount: number;
  transactionDate?: string;
  description: string;
}

interface CreateTransferRequest {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transactionDate?: string;
  description?: string;
}
```

### Expense Categories

| Method | Endpoint                                 | Description             |
| ------ | ---------------------------------------- | ----------------------- |
| GET    | `/api/v1/finance/expense-categories`     | List expense categories |
| POST   | `/api/v1/finance/expense-categories`     | Create category         |
| PATCH  | `/api/v1/finance/expense-categories/:id` | Update category         |
| DELETE | `/api/v1/finance/expense-categories/:id` | Delete category         |

### Payments (AR/AP)

| Method | Endpoint                           | Description                   |
| ------ | ---------------------------------- | ----------------------------- |
| GET    | `/api/v1/finance/receivables`      | List account receivables      |
| GET    | `/api/v1/finance/payables`         | List account payables         |
| POST   | `/api/v1/finance/payments/receive` | Receive payment from customer |
| POST   | `/api/v1/finance/payments/pay`     | Pay to supplier               |

```typescript
interface ReceivePaymentRequest {
  customerId: string;
  accountId: string;
  amount: number;
  paymentMethod: 'cash' | 'transfer' | 'qris';
  orderId?: string; // Apply to specific order
  reference?: string;
  notes?: string;
}

interface PaySupplierRequest {
  supplierId: string;
  accountId: string;
  amount: number;
  purchaseOrderId?: string;
  reference?: string;
  notes?: string;
}
```

---

## 9. Reports

| Method | Endpoint                                | Description              |
| ------ | --------------------------------------- | ------------------------ |
| GET    | `/api/v1/reports/dashboard`             | Dashboard summary        |
| GET    | `/api/v1/reports/sales`                 | Sales report             |
| GET    | `/api/v1/reports/sales/by-product`      | Sales by product         |
| GET    | `/api/v1/reports/sales/by-customer`     | Sales by customer        |
| GET    | `/api/v1/reports/sales/by-cashier`      | Sales by cashier         |
| GET    | `/api/v1/reports/purchases`             | Purchase report          |
| GET    | `/api/v1/reports/purchases/by-supplier` | Purchases by supplier    |
| GET    | `/api/v1/reports/inventory`             | Inventory report         |
| GET    | `/api/v1/reports/inventory/valuation`   | Stock valuation          |
| GET    | `/api/v1/reports/inventory/movement`    | Stock movement report    |
| GET    | `/api/v1/reports/profit-loss`           | Profit & Loss            |
| GET    | `/api/v1/reports/cash-flow`             | Cash flow report         |
| GET    | `/api/v1/reports/ar`                    | Account receivable aging |
| GET    | `/api/v1/reports/ap`                    | Account payable aging    |

```typescript
interface ReportQuery {
  startDate: string;
  endDate: string;
  outletId?: string;
  warehouseId?: string;
  groupBy?: 'day' | 'week' | 'month';
  format?: 'json' | 'xlsx' | 'pdf';
}

interface DashboardResponse {
  salesSummary: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    growth: number; // % vs last month
  };
  topProducts: {
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }[];
  lowStockAlerts: {
    id: string;
    name: string;
    currentStock: number;
    minStock: number;
  }[];
  recentTransactions: TransactionSummary[];
  receivablesSummary: {
    total: number;
    overdue: number;
  };
  payablesSummary: {
    total: number;
    overdue: number;
  };
}

interface SalesReportResponse {
  summary: {
    totalSales: number;
    totalTransactions: number;
    averageTransaction: number;
    totalDiscount: number;
    totalTax: number;
    grossProfit: number;
  };
  data: {
    date: string;
    sales: number;
    transactions: number;
    profit: number;
  }[];
  paymentBreakdown: {
    method: string;
    amount: number;
    count: number;
  }[];
}
```

---

## 10. Settings & Configuration

### App Settings (Key-Value)

| Method | Endpoint                         | Description              |
| ------ | -------------------------------- | ------------------------ |
| GET    | `/api/v1/settings`               | Get all settings         |
| GET    | `/api/v1/settings/:key`          | Get single setting       |
| PUT    | `/api/v1/settings/:key`          | Update single setting    |
| POST   | `/api/v1/settings/batch`         | Batch update settings    |
| GET    | `/api/v1/settings/category/:cat` | Get settings by category |

```typescript
interface AppSetting {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: 'general' | 'company' | 'tax' | 'receipt' | 'display';
  label: string | null;
}

interface UpdateSettingRequest {
  value: string;
}

interface BatchUpdateRequest {
  settings: {
    key: string;
    value: string;
  }[];
}
```

### Outlets

| Method | Endpoint              | Description   |
| ------ | --------------------- | ------------- |
| GET    | `/api/v1/outlets`     | List outlets  |
| GET    | `/api/v1/outlets/:id` | Get outlet    |
| POST   | `/api/v1/outlets`     | Create outlet |
| PATCH  | `/api/v1/outlets/:id` | Update outlet |
| DELETE | `/api/v1/outlets/:id` | Delete outlet |

```typescript
interface OutletRequest {
  code: string;
  name: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}
```

### Printer Configuration

| Method | Endpoint          | Description           |
| ------ | ----------------- | --------------------- |
| GET    | `/api/v1/printer` | Get printer config    |
| PATCH  | `/api/v1/printer` | Update printer config |

```typescript
interface PrinterConfig {
  type: 'usb' | 'network' | 'bluetooth';
  width: 58 | 80;
  address?: string;
  deviceId?: string;
  autoPrint: boolean;
  copies: number;
}
```

### Backup & Restore

| Method | Endpoint          | Description            |
| ------ | ----------------- | ---------------------- |
| POST   | `/api/v1/backup`  | Trigger manual backup  |
| GET    | `/api/v1/backups` | List available backups |
| POST   | `/api/v1/restore` | Restore from backup    |

---

## Error Handling

```typescript
// Standard error response (RFC 7807)
interface ProblemDetails {
  type: string; // Error type URI
  title: string; // Short summary
  status: number; // HTTP status code
  detail: string; // Detailed explanation
  instance: string; // Request path
  errors?: {
    // Validation errors
    field: string;
    message: string;
  }[];
}

// Common error types
('/errors/validation'); // 400 - Validation failed
('/errors/unauthorized'); // 401 - Not authenticated
('/errors/forbidden'); // 403 - No permission
('/errors/not-found'); // 404 - Resource not found
('/errors/conflict'); // 409 - Duplicate/conflict
('/errors/internal'); // 500 - Server error
```

### Example Error Response

```json
{
  "type": "/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "Request body contains invalid data",
  "instance": "/api/v1/products",
  "errors": [
    { "field": "name", "message": "Name is required" },
    { "field": "sellPrice", "message": "Must be greater than 0" }
  ]
}
```

---

## Pagination

All list endpoints return paginated responses:

```typescript
interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

Query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sortBy` - Field to sort by
- `sortOrder` - 'asc' or 'desc'
