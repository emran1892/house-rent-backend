import { ScheduleModule } from '@nestjs/schedule';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { Organization } from './modules/organizations/entities/organization.entity';
import { User } from './modules/users/entities/user.entity';
import { Building } from './modules/building/entities/building.entity';
import { Unit } from './modules/units/entities/unit.entity';
import { BuildingsModule } from './modules/building/buildings.module';
import { UnitsModule } from './modules/units/units.module';
import { Tenant } from './modules/tenants/entities/tenant.entity';
import { Lease } from './modules/leases/entities/lease.entity';
import { LeasesModule } from './modules/leases/leases.module';
import { TenantsModule } from './modules/tenants/tenants.module';
import { Invoice } from './modules/invoices/entities/invoice.entity';
import { InvoiceItem } from './modules/invoices/entities/invoice-item.entity';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { Payment } from './modules/payments/entities/payment.entity';
import { PaymentsModule } from './modules/payments/payments.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import {TenantPortalModule} from './modules/tenant-portal/tenant-portal.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig],
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        entities: [Organization, User, Building, Unit, Tenant, Lease, InvoiceItem, Invoice, Payment],
        synchronize: false,
      }),
    }),

    HealthModule,
    AuthModule,
    BuildingsModule,
    UnitsModule,
    TenantsModule,
    LeasesModule,
    InvoicesModule,
    PaymentsModule,
    DashboardModule,
    ScheduleModule.forRoot(),
    TenantPortalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}