-- CreateTable
CREATE TABLE "Outlet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "pin" TEXT,
    "name" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLogin" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserOutlet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    CONSTRAINT "UserOutlet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserOutlet_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    CONSTRAINT "Permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "entityId" TEXT,
    "entityType" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "parentId" TEXT,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "index" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Category_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UnitOfMeasure" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "baseUnitId" TEXT,
    "conversionRate" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UnitOfMeasure_baseUnitId_fkey" FOREIGN KEY ("baseUnitId") REFERENCES "UnitOfMeasure" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "categoryId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "costPrice" DECIMAL NOT NULL,
    "sellPrice" DECIMAL NOT NULL,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isService" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Product_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "UnitOfMeasure" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductImage_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "barcode" TEXT,
    "name" TEXT NOT NULL,
    "attributes" TEXT NOT NULL,
    "costPrice" DECIMAL NOT NULL,
    "sellPrice" DECIMAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceLevel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "minQty" INTEGER NOT NULL DEFAULT 1,
    "price" DECIMAL NOT NULL,
    CONSTRAINT "PriceLevel_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Warehouse" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Stock" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL DEFAULT 0,
    "reservedQty" DECIMAL NOT NULL DEFAULT 0,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stock_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Stock_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "variantId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    CONSTRAINT "StockMovement_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockMovement_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockAdjustment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adjustmentNumber" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockAdjustment_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockAdjustmentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adjustmentId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "systemQty" DECIMAL NOT NULL,
    "adjustmentQty" DECIMAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "StockAdjustmentItem_adjustmentId_fkey" FOREIGN KEY ("adjustmentId") REFERENCES "StockAdjustment" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockAdjustmentItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockTransfer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transferNumber" TEXT NOT NULL,
    "fromWarehouseId" TEXT NOT NULL,
    "toWarehouseId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "sentBy" TEXT,
    "sentAt" DATETIME,
    "receivedBy" TEXT,
    "receivedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockTransfer_fromWarehouseId_fkey" FOREIGN KEY ("fromWarehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "StockTransfer_toWarehouseId_fkey" FOREIGN KEY ("toWarehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockTransferItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transferId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "requestedQty" DECIMAL NOT NULL,
    "sentQty" DECIMAL NOT NULL DEFAULT 0,
    "receivedQty" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    CONSTRAINT "StockTransferItem_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES "StockTransfer" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockTransferItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockOpname" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opnameNumber" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "categoryId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,
    "finalizedBy" TEXT,
    "finalizedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StockOpname_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StockOpnameItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "opnameId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "systemQty" DECIMAL NOT NULL,
    "countedQty" DECIMAL,
    "difference" DECIMAL,
    "notes" TEXT,
    CONSTRAINT "StockOpnameItem_opnameId_fkey" FOREIGN KEY ("opnameId") REFERENCES "StockOpname" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StockOpnameItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "creditLimit" DECIMAL NOT NULL DEFAULT 0,
    "priceLevelId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SalesOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "customerId" TEXT,
    "userId" TEXT NOT NULL,
    "outletId" TEXT NOT NULL,
    "orderDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "subtotal" DECIMAL NOT NULL,
    "discountPercent" DECIMAL NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "taxPercent" DECIMAL NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SalesOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesOrder_outletId_fkey" FOREIGN KEY ("outletId") REFERENCES "Outlet" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "unitPrice" DECIMAL NOT NULL,
    "discountPercent" DECIMAL NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "subtotal" DECIMAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "SalesOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesOrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "refundMethod" TEXT,
    "refundAmount" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SalesReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SalesReturnItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnId" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "reason" TEXT,
    CONSTRAINT "SalesReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "SalesReturn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SalesReturnItem_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "SalesOrderItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentNumber" TEXT NOT NULL,
    "orderId" TEXT,
    "customerId" TEXT,
    "accountId" TEXT NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paymentMethod" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Payment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "taxId" TEXT,
    "paymentTermDays" INTEGER NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "bankAccount" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PurchaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "expectedDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "paymentStatus" TEXT NOT NULL DEFAULT 'unpaid',
    "subtotal" DECIMAL NOT NULL,
    "discountPercent" DECIMAL NOT NULL DEFAULT 0,
    "discountAmount" DECIMAL NOT NULL DEFAULT 0,
    "taxPercent" DECIMAL NOT NULL DEFAULT 0,
    "taxAmount" DECIMAL NOT NULL DEFAULT 0,
    "total" DECIMAL NOT NULL,
    "paidAmount" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseOrder_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "receivedQty" DECIMAL NOT NULL DEFAULT 0,
    "unitPrice" DECIMAL NOT NULL,
    "subtotal" DECIMAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "PurchaseOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchaseOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PurchaseOrderItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoodsReceive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiveNumber" TEXT NOT NULL,
    "purchaseOrderId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "receiveDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "GoodsReceive_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "GoodsReceive_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GoodsReceiveItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "receiveId" TEXT NOT NULL,
    "purchaseOrderItemId" TEXT NOT NULL,
    "receivedQty" DECIMAL NOT NULL,
    "notes" TEXT,
    CONSTRAINT "GoodsReceiveItem_receiveId_fkey" FOREIGN KEY ("receiveId") REFERENCES "GoodsReceive" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GoodsReceiveItem_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES "PurchaseOrderItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseReturn" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnNumber" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "reason" TEXT NOT NULL,
    "returnAmount" DECIMAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "approvedBy" TEXT,
    "approvedAt" DATETIME,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PurchaseReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "PurchaseOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PurchaseReturnItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "returnId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "quantity" DECIMAL NOT NULL,
    "reason" TEXT,
    CONSTRAINT "PurchaseReturnItem_returnId_fkey" FOREIGN KEY ("returnId") REFERENCES "PurchaseReturn" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PurchaseReturnItem_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "ProductVariant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplierPayment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "paymentNumber" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "purchaseOrderId" TEXT,
    "accountId" TEXT NOT NULL,
    "paymentDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amount" DECIMAL NOT NULL,
    "reference" TEXT,
    "notes" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SupplierPayment_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SupplierPayment_purchaseOrderId_fkey" FOREIGN KEY ("purchaseOrderId") REFERENCES "PurchaseOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "SupplierPayment_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DECIMAL NOT NULL DEFAULT 0,
    "bankName" TEXT,
    "accountNumber" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExpenseCategory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "transactionNumber" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "categoryId" TEXT,
    "type" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "transactionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ExpenseCategory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "licenseKey" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "maxOutlets" INTEGER NOT NULL DEFAULT 1,
    "maxUsers" INTEGER NOT NULL DEFAULT 3,
    "features" TEXT NOT NULL,
    "validFrom" DATETIME NOT NULL,
    "validUntil" DATETIME NOT NULL,
    "activatedAt" DATETIME,
    "machineId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'string',
    "category" TEXT NOT NULL DEFAULT 'general',
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BackupHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fileName" TEXT NOT NULL,
    "fileSize" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "location" TEXT,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "createdBy" TEXT,
    "notes" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "Outlet_code_key" ON "Outlet"("code");

-- CreateIndex
CREATE INDEX "Outlet_code_idx" ON "Outlet"("code");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_username_idx" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_roleId_idx" ON "User"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_token_idx" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserOutlet_userId_outletId_key" ON "UserOutlet"("userId", "outletId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_roleId_module_action_key" ON "Permission"("roleId", "module", "action");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_module_idx" ON "AuditLog"("module");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "Category_parentId_idx" ON "Category"("parentId");

-- CreateIndex
CREATE INDEX "Category_index_idx" ON "Category"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "Product_barcode_key" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_sku_idx" ON "Product"("sku");

-- CreateIndex
CREATE INDEX "Product_barcode_idx" ON "Product"("barcode");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE INDEX "Product_name_idx" ON "Product"("name");

-- CreateIndex
CREATE INDEX "ProductImage_productId_idx" ON "ProductImage"("productId");

-- CreateIndex
CREATE INDEX "ProductImage_order_idx" ON "ProductImage"("order");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_barcode_key" ON "ProductVariant"("barcode");

-- CreateIndex
CREATE INDEX "ProductVariant_productId_idx" ON "ProductVariant"("productId");

-- CreateIndex
CREATE INDEX "ProductVariant_sku_idx" ON "ProductVariant"("sku");

-- CreateIndex
CREATE INDEX "ProductVariant_barcode_idx" ON "ProductVariant"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "PriceLevel_productId_name_key" ON "PriceLevel"("productId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Warehouse_code_key" ON "Warehouse"("code");

-- CreateIndex
CREATE INDEX "Stock_warehouseId_idx" ON "Stock"("warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Stock_variantId_warehouseId_key" ON "Stock"("variantId", "warehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_variantId_idx" ON "StockMovement"("variantId");

-- CreateIndex
CREATE INDEX "StockMovement_warehouseId_idx" ON "StockMovement"("warehouseId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_referenceType_referenceId_idx" ON "StockMovement"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "StockAdjustment_adjustmentNumber_key" ON "StockAdjustment"("adjustmentNumber");

-- CreateIndex
CREATE INDEX "StockAdjustment_warehouseId_idx" ON "StockAdjustment"("warehouseId");

-- CreateIndex
CREATE INDEX "StockAdjustment_status_idx" ON "StockAdjustment"("status");

-- CreateIndex
CREATE INDEX "StockAdjustment_createdAt_idx" ON "StockAdjustment"("createdAt");

-- CreateIndex
CREATE INDEX "StockAdjustmentItem_adjustmentId_idx" ON "StockAdjustmentItem"("adjustmentId");

-- CreateIndex
CREATE UNIQUE INDEX "StockTransfer_transferNumber_key" ON "StockTransfer"("transferNumber");

-- CreateIndex
CREATE INDEX "StockTransfer_fromWarehouseId_idx" ON "StockTransfer"("fromWarehouseId");

-- CreateIndex
CREATE INDEX "StockTransfer_toWarehouseId_idx" ON "StockTransfer"("toWarehouseId");

-- CreateIndex
CREATE INDEX "StockTransfer_status_idx" ON "StockTransfer"("status");

-- CreateIndex
CREATE INDEX "StockTransferItem_transferId_idx" ON "StockTransferItem"("transferId");

-- CreateIndex
CREATE UNIQUE INDEX "StockOpname_opnameNumber_key" ON "StockOpname"("opnameNumber");

-- CreateIndex
CREATE INDEX "StockOpname_warehouseId_idx" ON "StockOpname"("warehouseId");

-- CreateIndex
CREATE INDEX "StockOpname_status_idx" ON "StockOpname"("status");

-- CreateIndex
CREATE INDEX "StockOpnameItem_opnameId_idx" ON "StockOpnameItem"("opnameId");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE INDEX "Customer_code_idx" ON "Customer"("code");

-- CreateIndex
CREATE INDEX "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "SalesOrder_orderNumber_key" ON "SalesOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "SalesOrder_orderNumber_idx" ON "SalesOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "SalesOrder_customerId_idx" ON "SalesOrder"("customerId");

-- CreateIndex
CREATE INDEX "SalesOrder_outletId_idx" ON "SalesOrder"("outletId");

-- CreateIndex
CREATE INDEX "SalesOrder_orderDate_idx" ON "SalesOrder"("orderDate");

-- CreateIndex
CREATE INDEX "SalesOrder_status_idx" ON "SalesOrder"("status");

-- CreateIndex
CREATE INDEX "SalesOrderItem_orderId_idx" ON "SalesOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "SalesOrderItem_variantId_idx" ON "SalesOrderItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "SalesReturn_returnNumber_key" ON "SalesReturn"("returnNumber");

-- CreateIndex
CREATE INDEX "SalesReturn_orderId_idx" ON "SalesReturn"("orderId");

-- CreateIndex
CREATE INDEX "SalesReturn_status_idx" ON "SalesReturn"("status");

-- CreateIndex
CREATE INDEX "SalesReturnItem_returnId_idx" ON "SalesReturnItem"("returnId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentNumber_key" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_paymentNumber_idx" ON "Payment"("paymentNumber");

-- CreateIndex
CREATE INDEX "Payment_orderId_idx" ON "Payment"("orderId");

-- CreateIndex
CREATE INDEX "Payment_paymentDate_idx" ON "Payment"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "Supplier_code_key" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_code_idx" ON "Supplier"("code");

-- CreateIndex
CREATE INDEX "Supplier_name_idx" ON "Supplier"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseOrder_orderNumber_key" ON "PurchaseOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_orderNumber_idx" ON "PurchaseOrder"("orderNumber");

-- CreateIndex
CREATE INDEX "PurchaseOrder_supplierId_idx" ON "PurchaseOrder"("supplierId");

-- CreateIndex
CREATE INDEX "PurchaseOrder_status_idx" ON "PurchaseOrder"("status");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_orderId_idx" ON "PurchaseOrderItem"("orderId");

-- CreateIndex
CREATE INDEX "PurchaseOrderItem_variantId_idx" ON "PurchaseOrderItem"("variantId");

-- CreateIndex
CREATE UNIQUE INDEX "GoodsReceive_receiveNumber_key" ON "GoodsReceive"("receiveNumber");

-- CreateIndex
CREATE INDEX "GoodsReceive_purchaseOrderId_idx" ON "GoodsReceive"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "GoodsReceive_warehouseId_idx" ON "GoodsReceive"("warehouseId");

-- CreateIndex
CREATE INDEX "GoodsReceiveItem_receiveId_idx" ON "GoodsReceiveItem"("receiveId");

-- CreateIndex
CREATE UNIQUE INDEX "PurchaseReturn_returnNumber_key" ON "PurchaseReturn"("returnNumber");

-- CreateIndex
CREATE INDEX "PurchaseReturn_orderId_idx" ON "PurchaseReturn"("orderId");

-- CreateIndex
CREATE INDEX "PurchaseReturn_status_idx" ON "PurchaseReturn"("status");

-- CreateIndex
CREATE INDEX "PurchaseReturnItem_returnId_idx" ON "PurchaseReturnItem"("returnId");

-- CreateIndex
CREATE UNIQUE INDEX "SupplierPayment_paymentNumber_key" ON "SupplierPayment"("paymentNumber");

-- CreateIndex
CREATE INDEX "SupplierPayment_supplierId_idx" ON "SupplierPayment"("supplierId");

-- CreateIndex
CREATE INDEX "SupplierPayment_purchaseOrderId_idx" ON "SupplierPayment"("purchaseOrderId");

-- CreateIndex
CREATE INDEX "SupplierPayment_paymentDate_idx" ON "SupplierPayment"("paymentDate");

-- CreateIndex
CREATE UNIQUE INDEX "Account_code_key" ON "Account"("code");

-- CreateIndex
CREATE INDEX "Account_code_idx" ON "Account"("code");

-- CreateIndex
CREATE INDEX "Account_type_idx" ON "Account"("type");

-- CreateIndex
CREATE UNIQUE INDEX "ExpenseCategory_name_key" ON "ExpenseCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionNumber_key" ON "Transaction"("transactionNumber");

-- CreateIndex
CREATE INDEX "Transaction_accountId_idx" ON "Transaction"("accountId");

-- CreateIndex
CREATE INDEX "Transaction_transactionDate_idx" ON "Transaction"("transactionDate");

-- CreateIndex
CREATE INDEX "Transaction_type_idx" ON "Transaction"("type");

-- CreateIndex
CREATE INDEX "Transaction_referenceType_referenceId_idx" ON "Transaction"("referenceType", "referenceId");

-- CreateIndex
CREATE UNIQUE INDEX "License_licenseKey_key" ON "License"("licenseKey");

-- CreateIndex
CREATE INDEX "License_licenseKey_idx" ON "License"("licenseKey");

-- CreateIndex
CREATE UNIQUE INDEX "AppSettings_key_key" ON "AppSettings"("key");

-- CreateIndex
CREATE INDEX "AppSettings_category_idx" ON "AppSettings"("category");

-- CreateIndex
CREATE INDEX "BackupHistory_startedAt_idx" ON "BackupHistory"("startedAt");

-- CreateIndex
CREATE INDEX "BackupHistory_status_idx" ON "BackupHistory"("status");
