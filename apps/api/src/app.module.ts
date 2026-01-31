import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma';
import { AuthModule } from './modules/core/auth';
import { AuditLogModule } from './modules/core/audit-log';
import { OutletsModule } from './modules/core/outlets';
import { RolesModule } from './modules/core/roles';
import { SettingsModule } from './modules/core/settings';
import { UsersModule } from './modules/core/users';

import { CategoriesModule } from './modules/master-data/categories';
import { ProductsModule } from './modules/master-data/products';
import { UnitsModule } from './modules/master-data/units';
import { CustomersModule } from './modules/master-data/customers';
import { WarehousesModule } from './modules/master-data/warehouses';

import { TransactionsModule } from './modules/pos/transactions';
import { PaymentsModule } from './modules/pos/payments';

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
    RolesModule,
    SettingsModule,
    UsersModule,
    // Master Data modules
    CategoriesModule,
    ProductsModule,
    UnitsModule,
    CustomersModule,
    WarehousesModule,
    // POS modules
    TransactionsModule,
    PaymentsModule,
    // Upload module
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
