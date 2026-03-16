import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma';
import { AuthModule } from './modules/core/auth';
import { AuditLogModule } from './modules/core/audit-log';
import { OutletsModule } from './modules/core/outlets';
import { PrintersModule } from './modules/core/printers';
import { RolesModule } from './modules/core/roles';
import { SettingsModule } from './modules/core/settings';
import { UsersModule } from './modules/core/users';

import { CategoriesModule } from './modules/master-data/categories';
import { ProductsModule } from './modules/master-data/products';
import { UnitsModule } from './modules/master-data/units';
import { CustomersModule } from './modules/master-data/customers';
import { WarehousesModule } from './modules/master-data/warehouses';
import { SuppliersModule } from './modules/master-data/suppliers';
import { PromotionsModule } from './modules/master-data/promotions';
import { PaymentTermsModule } from './modules/master-data/payment-terms/payment-terms.module';

import { StockModule } from './modules/inventory/stock';
import { StockAdjustmentsModule } from './modules/inventory/adjustments';
import { StockTransfersModule } from './modules/inventory/transfers';
import { StockOpnameModule } from './modules/inventory/opname';
import { StockLotsModule } from './modules/inventory/stock-lots';
import { StockValuationModule } from './modules/inventory/stock-valuation';
import { TransactionsModule } from './modules/pos/transactions';
import { PaymentsModule } from './modules/pos/payments';
import { ReturnsModule } from './modules/pos/returns';

import { PurchaseOrdersModule } from './modules/purchases/orders';
import { PurchaseReturnsModule } from './modules/purchases/returns';
import { SupplierPaymentsModule } from './modules/purchases/payments';
import { AccountsModule } from './modules/finance/accounts';
import { GoodsReceiveModule } from './modules/inventory/goods-receive';
import { SalesOrdersModule } from './modules/sales/orders';
import { InvoicesModule } from './modules/sales/invoices';
import { DeliveryOrdersModule } from './modules/sales/delivery-orders';

import { DashboardReportModule } from './modules/reports/dashboard';
import { SalesReportModule } from './modules/reports/sales';
import { StockReportModule } from './modules/reports/inventory';
import { ExportModule } from './modules/reports/export';

import { UploadModule } from './modules/upload';

import { AppService } from './app.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    PrismaModule,
    AuditLogModule,
    AuthModule,
    OutletsModule,
    PrintersModule,
    RolesModule,
    SettingsModule,
    UsersModule,
    // Master Data modules
    CategoriesModule,
    ProductsModule,
    UnitsModule,
    CustomersModule,
    SuppliersModule,
    WarehousesModule,
    PromotionsModule,
    PaymentTermsModule,
    // Inventory modules
    StockModule,
    StockAdjustmentsModule,
    StockTransfersModule,
    StockOpnameModule,
    StockLotsModule,
    StockValuationModule,
    // POS modules
    TransactionsModule,
    PaymentsModule,
    ReturnsModule,
    // Purchase modules
    PurchaseOrdersModule,
    PurchaseReturnsModule,
    SupplierPaymentsModule,
    // Inventory modules
    GoodsReceiveModule,
    // Sales modules
    SalesOrdersModule,
    InvoicesModule,
    DeliveryOrdersModule,
    // Finance modules
    AccountsModule,
    // Reports modules
    DashboardReportModule,
    SalesReportModule,
    StockReportModule,
    ExportModule,
    // Upload module
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
