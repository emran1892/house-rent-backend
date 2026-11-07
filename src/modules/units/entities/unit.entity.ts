import { Entity, Column, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { Building } from '../../building/entities/building.entity';
import { UnitStatus } from '../../../common/enum/unit-status.enum';

@Entity('units')
@Index(['building_id', 'code'], { unique: true }) // একই বাড়ির মধ্যে দুটি ফ্ল্যাটের কোড এক হতে পারবে না
@Index(['building_id', 'status'])
export class Unit extends BaseEntity {
  @Column({ type: 'uuid' })
  organization_id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  @Column({ type: 'uuid' })
  building_id: string;

  @ManyToOne(() => Building, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'building_id' })
  building: Building;

  @Column({ type: 'varchar', length: 50 })
  code: string; // যেমন: "101", "2A"

  @Column({ type: 'int' })
  floor: number;

  @Column({ type: 'int', default: 1 })
  bedrooms: number;

  @Column({ type: 'int', default: 1 })
  bathrooms: number;

  @Column({ type: 'numeric', precision: 8, scale: 2, nullable: true })
  size_sqft: number;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  base_rent: number; // নতুন ভাড়াটিয়ার জন্য নির্ধারিত ভাড়া

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  advance_amount: number;

  @Column({
    type: 'enum',
    enum: UnitStatus,
    default: UnitStatus.VACANT,
  })
  status: UnitStatus;

  @Column({ type: 'text', array: true, default: '{}' })
  facilities: string[]; // যেমন: ['Generator', 'Lift', 'Gas']

  @Column({ type: 'text', array: true, default: '{}' })
  photos: string[];

  @Column({ type: 'boolean', default: true })
  is_listed: boolean; // পাবলিক টু-লেট পেজে দেখাবে কি না
}