import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('buildings')
export class Building extends BaseEntity {
  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text' })
  address: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  slug: string; // QR কোডের জন্য ইউনিক লিংক (যেমন: /to-let/zamzam-tower)

  @Column({ type: 'int', default: 1 })
  floors_count: number;
}