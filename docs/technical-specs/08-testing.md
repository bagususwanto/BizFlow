# Testing Specifications

## Test Strategy

| Type              | Tool            | Coverage Target     |
| ----------------- | --------------- | ------------------- |
| Unit Tests        | Vitest          | 80% business logic  |
| Integration Tests | Vitest + Prisma | All API endpoints   |
| E2E Tests         | Playwright      | Critical user flows |
| Performance Tests | k6              | API response times  |

---

## Unit Test Example

```typescript
// apps/api/src/modules/products/products.service.spec.ts
import { describe, it, expect, beforeEach } from "vitest";
import { ProductsService } from "./products.service";
import { PrismaService } from "@/common/prisma.service";

describe("ProductsService", () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(() => {
    prisma = new PrismaService();
    service = new ProductsService(prisma);
  });

  describe("create", () => {
    it("should create a product with valid data", async () => {
      const data = {
        sku: "PRD-001",
        name: "Test Product",
        categoryId: "cat-1",
        unitId: "unit-1",
        costPrice: 10000,
        sellPrice: 15000,
      };

      const result = await service.create(data);

      expect(result).toMatchObject({
        sku: "PRD-001",
        name: "Test Product",
        sellPrice: 15000,
      });
    });

    it("should throw error for duplicate SKU", async () => {
      // ...
    });
  });

  describe("calculateProfit", () => {
    it("should calculate profit correctly", () => {
      const profit = service.calculateProfit(10000, 15000);
      expect(profit).toEqual({
        amount: 5000,
        percentage: 50,
      });
    });
  });
});
```

---

## E2E Test Example

```typescript
// apps/web/tests/e2e/pos.spec.ts
import { test, expect } from "@playwright/test";

test.describe("POS Module", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.fill('[data-testid="username"]', "kasir");
    await page.fill('[data-testid="password"]', "password");
    await page.click('[data-testid="login-button"]');
    await page.waitForURL("/pos");
  });

  test("should add product to cart via barcode", async ({ page }) => {
    // Simulate barcode scan
    await page.keyboard.type("8991234567890");
    await page.keyboard.press("Enter");

    // Verify product added
    await expect(page.locator('[data-testid="cart-item"]')).toHaveCount(1);
    await expect(page.locator('[data-testid="total"]')).toContainText("Rp");
  });

  test("should process cash payment", async ({ page }) => {
    // Add product
    await page.click('[data-testid="product-PRD001"]');

    // Click pay
    await page.click('[data-testid="pay-button"]');

    // Select cash
    await page.click('[data-testid="payment-cash"]');

    // Enter amount
    await page.fill('[data-testid="amount-input"]', "50000");
    await page.click('[data-testid="process-button"]');

    // Verify success
    await expect(page.locator('[data-testid="success-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="change-amount"]')).toContainText(
      "Kembalian"
    );
  });
});
```

---

## Test Coverage Goals

| Module    | Unit | Integration | E2E              |
| --------- | ---- | ----------- | ---------------- |
| Auth      | 90%  | 100%        | Login, Logout    |
| Products  | 80%  | 100%        | CRUD flow        |
| POS       | 85%  | 100%        | Full transaction |
| Sales     | 80%  | 100%        | Order to payment |
| Inventory | 80%  | 100%        | Stock adjustment |
| Reports   | 70%  | 100%        | Export           |
