import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Lease } from '../../leases/entities/lease.entity';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceStatus } from '../../../common/enum/invoice-status.enum';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid' })
  lease_id: string;

  @ManyToOne(() => Lease, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'lease_id' })
  lease: Lease;

  @Column({ type: 'varchar', length: 50, unique: true })
  invoice_number: string; // যেমন: INV-202611-XXXX

  @Column({ type: 'varchar', length: 7 })
  billing_period: string; // Month and year for which the bill is generated, e.g., "2026-11" for November 2026

  @Column({ type: 'date' })
  due_date: string; // Billing due date (YYYY-MM-DD)

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  paid_amount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, { cascade: true })
  items: InvoiceItem[];
}