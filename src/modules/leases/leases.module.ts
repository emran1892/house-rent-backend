import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lease } from './entities/lease.entity';
import { Unit } from '../units/entities/unit.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { LeasesService } from './leases.service';
import { LeasesController } from './leases.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Lease, Unit, Tenant])],
  controllers: [LeasesController],
  providers: [LeasesService],
  exports: [LeasesService],
})
export class LeasesModule {}