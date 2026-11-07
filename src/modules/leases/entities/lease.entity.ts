import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Unit } from '../../units/entities/unit.entity';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { LeaseStatus } from '../../../common/enum/lease-status.enum';

@Entity('leases')
export class Lease extends BaseEntity {
  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid' })
  unit_id: string;

  @ManyToOne(() => Unit, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'unit_id' })
  unit: Unit;

  @Column({ type: 'uuid' })
  tenant_id: string;

  @ManyToOne(() => Tenant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tenant_id' })
  tenant: Tenant;

  @Column({ type: 'date' })
  start_date: string; // start date (YYYY-MM-DD)

  @Column({ type: 'date', nullable: true })
  end_date: string; // end date

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  monthly_rent: number; // monthly rent

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  security_deposit: number; // security deposit

  @Column({ type: 'int', default: 5 })
  rent_due_day: number; // day of the month when rent is due (e.g., 5 or 10)
  @Column({
    type: 'enum',
    enum: LeaseStatus,
    default: LeaseStatus.ACTIVE,
  })
  status: LeaseStatus;
}