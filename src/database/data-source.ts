import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Organization } from '../modules/organizations/entities/organization.entity';
import { User } from '../modules/users/entities/user.entity';
import { Building } from '../modules/building/entities/building.entity';
import { Unit } from '../modules/units/entities/unit.entity';
import { Tenant } from '../modules/tenants/entities/tenant.entity';
import { Lease } from '../modules/leases/entities/lease.entity';
import {InvoiceItem} from '../modules/invoices/entities/invoice-item.entity';
import { Invoice } from '../modules/invoices/entities/invoice.entity';
import {Payment} from '../modules/payments/entities/payment.entity';

// .env file
config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'emran',
  database: process.env.DB_NAME || 'RentEase',
  entities: [Organization, User, Building, Unit, Tenant, Lease, InvoiceItem, Invoice, Payment],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
});