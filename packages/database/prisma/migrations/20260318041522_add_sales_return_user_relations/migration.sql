-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SalesReturn" (
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
    CONSTRAINT "SalesReturn_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "SalesOrder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesReturn_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SalesReturn_approvedBy_fkey" FOREIGN KEY ("approvedBy") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_SalesReturn" ("approvedAt", "approvedBy", "createdAt", "createdBy", "id", "notes", "orderId", "reason", "refundAmount", "refundMethod", "returnNumber", "status", "updatedAt") SELECT "approvedAt", "approvedBy", "createdAt", "createdBy", "id", "notes", "orderId", "reason", "refundAmount", "refundMethod", "returnNumber", "status", "updatedAt" FROM "SalesReturn";
DROP TABLE "SalesReturn";
ALTER TABLE "new_SalesReturn" RENAME TO "SalesReturn";
CREATE UNIQUE INDEX "SalesReturn_returnNumber_key" ON "SalesReturn"("returnNumber");
CREATE INDEX "SalesReturn_orderId_idx" ON "SalesReturn"("orderId");
CREATE INDEX "SalesReturn_status_idx" ON "SalesReturn"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
