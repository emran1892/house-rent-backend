import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Invoice } from './invoice.entity';

@Entity('invoice_items')
export class InvoiceItem extends BaseEntity {
  @Column({ type: 'uuid' })
  invoice_id: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 100 })
  title: string; // example: "Rent for November 2026", "Electricity Bill", "Water Bill"

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;
}