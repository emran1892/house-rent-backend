import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

@Entity('organizations')
export class Organization extends BaseEntity {
  @Column({ type: 'varchar', length: 150 })
  name: string; // Institution or organization name (e.g., Rahim Properties)

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string; // Unique identifier name (e.g., rahim-properties)

  @Column({ type: 'varchar', default: 'FREE' })
  plan: string; // Subscription plan: FREE, BASIC, PRO

  @Column({ type: 'timestamptz', nullable: true })
  plan_expires_at: Date; // Plan expiration date

  @Column({ type: 'jsonb', nullable: true })
  payment_info: Record<string, any>; // bKash, Nagad number or bank information

  @Column({ type: 'text', nullable: true })
  logo_url: string; // Logo
}