import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository,DataSource } from 'typeorm';

import { Building } from './entities/building.entity';
import { CreateBuildingDto } from './dto/create-building.dto';
import { UnitStatus } from '../../common/enum/unit-status.enum';
import { Unit } from '../units/entities/unit.entity';

@Injectable()
export class BuildingsService {
  constructor(
    @InjectRepository(Building)
    private readonly buildingRepository: Repository<Building>,
    private readonly dataSource: DataSource,
  ) {}

  // ১. নতুন বাড়ি তৈরি
  async create(organizationId: string, dto: CreateBuildingDto) {
    // ইউনিক স্লাগ (slug) তৈরি (যেমন: zamzam-tower-1234)
    const baseSlug = dto.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-');
    const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

    const building = this.buildingRepository.create({
      ...dto,
      organization_id: organizationId,
      slug: uniqueSlug,
    });

    return await this.buildingRepository.save(building);
  }

  // ২. লগইন করা ওনারের সব বাড়ির তালিকা দেখা
  async findAll(organizationId: string) {
    return await this.buildingRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
    });
  }

  // ৩. নির্দিষ্ট একটি বাড়ির বিস্তারিত দেখা
  async findOne(organizationId: string, id: string) {
    const building = await this.buildingRepository.findOne({
      where: { id, organization_id: organizationId },
    });

    if (!building) {
      throw new NotFoundException('Building not found');
    }

    return building;
  }

 


async getPublicToLetDetails(slug: string) {
  // ১. স্লাগ দিয়ে বিল্ডিং এবং মালিকের তথ্য লোড করা
  const building = await this.buildingRepository.findOne({
    where: { slug },
    relations: {
      organization: true,
    },
  });

  if (!building) {
    throw new NotFoundException('বিল্ডিংটি খুঁজে পাওয়া যায়নি');
  }

  // ২. শুধুমাত্র খালি এবং প্রদর্শনের উপযোগী ফ্ল্যাটগুলো নিয়ে আসা
  const unitRepo = this.dataSource.getRepository(Unit);
  const vacantUnits = await unitRepo.find({
    where: {
      building_id: building.id,
      status: UnitStatus.VACANT,
      is_listed: true,
    },
    select: {
      id: true,
      code: true,
      floor: true,
      bedrooms: true,
      bathrooms: true,
      size_sqft: true,
      base_rent: true,
      advance_amount: true,
      facilities: true,
      photos: true,
    },
    order: { floor: 'ASC', code: 'ASC' },
  });

  return {
    building: {
      name: building.name,
      address: building.address,
      floors_count: building.floors_count,
    },
    contact: {
      organization_name: building.organization?.name,
      available_units_count: vacantUnits.length,
      units: vacantUnits,
    },
    
  };
}
}