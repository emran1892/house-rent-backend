import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from './entities/unit.entity';
import { Building } from '../building/entities/building.entity';
import { CreateUnitDto } from './dto/create-unit.dto';

@Injectable()
export class UnitsService {
  constructor(
    @InjectRepository(Unit)
    private readonly unitRepository: Repository<Unit>,
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
  ) {}

  // ১. নির্দিষ্ট বাড়ির অধীনে নতুন ইউনিট তৈরি
  async create(organizationId: string, buildingId: string, dto: CreateUnitDto) {
    // বাড়িটি এই ওনারের কি না তা নিশ্চিত করা
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId, organization_id: organizationId },
    });

    if (!building) {
      throw new NotFoundException('not found');
    }

    // একই বাড়িতে একই নম্বরের ফ্ল্যাট আগে থেকে আছে কি না যাচাই
    const existingUnit = await this.unitRepository.findOne({
      where: { building_id: buildingId, code: dto.code },
    });

    if (existingUnit) {
      throw new ConflictException(`এই বাড়িতে '${dto.code}' নম্বরের ইউনিট ইতোমধ্যে বিদ্যমান`);
    }

    const unit = this.unitRepository.create({
      ...dto,
      building_id: buildingId,
      organization_id: organizationId,
    });

    return await this.unitRepository.save(unit);
  }

  // ২. নির্দিষ্ট বাড়ির সব ইউনিট দেখা
  async findAllByBuilding(organizationId: string, buildingId: string) {
    // ওনারশিপ ভ্যালিডেশন
    const building = await this.buildingRepository.findOne({
      where: { id: buildingId, organization_id: organizationId },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return await this.unitRepository.find({
      where: { building_id: buildingId, organization_id: organizationId },
      order: { floor: 'ASC', code: 'ASC' },
    });
  }

  // ৩. নির্দিষ্ট একটি ইউনিটের তথ্য দেখা
  async findOne(organizationId: string, id: string) {
    const unit = await this.unitRepository.findOne({
      where: { id, organization_id: organizationId },
      relations: {
        building: true, 
      },
    });

    if (!unit) {
      throw new NotFoundException('Unit not found');
    }

    return unit;
  }
}