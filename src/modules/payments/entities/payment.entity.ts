import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Invoice } from '../../invoices/entities/invoice.entity';
import { PaymentMethod } from '../../../common/enum/payment-method.enum';
import { PaymentStatus } from '../../../common/enum/payment-status.enum';

@Entity('payments')
export class Payment extends BaseEntity {
  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid' })
  invoice_id: string;

  @ManyToOne(() => Invoice, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ type: 'varchar', length: 50, unique: true })
  receipt_number: string; // যেমন: REC-202611-XXXX

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  payment_date: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    default: PaymentMethod.CASH,
  })
  payment_method: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_reference: string; // online payment transection reference

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.SUBMITTED,
  })
  status: PaymentStatus;

  @Column({ type: 'text', nullable: true })
  rejection_reason: string;


  @Column({ type: 'text', nullable: true })
  note: string;


}