import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tenants')
export class Tenant extends BaseEntity {
  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // Tenant can be linked to a User account, but it's optional. If the tenant doesn't have a user account, this field can be null.
  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  phone: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  nid_passport: string; // IND or passport number

  @Column({ type: 'varchar', length: 20, nullable: true })
  emergency_contact: string;

  @Column({ type: 'text', nullable: true })
  permanent_address: string;
}