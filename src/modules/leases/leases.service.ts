import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Lease } from './entities/lease.entity';
import { Unit } from '../units/entities/unit.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { UnitStatus } from '../../common/enum/unit-status.enum';
import { LeaseStatus } from '../../common/enum/lease-status.enum';

@Injectable()
export class LeasesService {
  constructor(private readonly dataSource: DataSource) {}

  async create(organizationId: string, dto: CreateLeaseDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const unitRepo = queryRunner.manager.getRepository(Unit);
      const tenantRepo = queryRunner.manager.getRepository(Tenant);
      const leaseRepo = queryRunner.manager.getRepository(Lease);

      // ১. ইউনিট চেক করা (ফ্ল্যাটটি ওনারের কি না এবং খালি আছে কি না)
      const unit = await unitRepo.findOne({
        where: { id: dto.unit_id, organization_id: organizationId },
      });

      if (!unit) {
        throw new NotFoundException('ফ্ল্যাটটি খুঁজে পাওয়া যায়নি');
      }

      if (unit.status !== UnitStatus.VACANT) {
        throw new BadRequestException('এই ফ্ল্যাটটি বর্তমানে খালি নেই');
      }

      // ২. ভাড়াটিয়া চেক করা (ভাড়াটিয়া এই ওনারের তালিকায় আছে কি না)
      const tenant = await tenantRepo.findOne({
        where: { id: dto.tenant_id, organization_id: organizationId },
      });

      if (!tenant) {
        throw new NotFoundException('ভাড়াটিয়া পাওয়া যায়নি');
      }

      // ৩. নতুন লিজ চুক্তি তৈরি
      const lease = leaseRepo.create({
        ...dto,
        organization_id: organizationId,
        status: LeaseStatus.ACTIVE,
      });
      const savedLease = await leaseRepo.save(lease);

      // ৪. ফ্ল্যাটের স্ট্যাটাস OCCUPIED করা
      unit.status = UnitStatus.OCCUPIED;
      await unitRepo.save(unit);

      await queryRunner.commitTransaction();
      return savedLease;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(organizationId: string) {
    const leaseRepo = this.dataSource.getRepository(Lease);
    return await leaseRepo.find({
      where: { organization_id: organizationId },
      relations: {
        unit: {
          building: true,
        },
        tenant: true,
      },
      order: { created_at: 'DESC' },
    });
  }
}