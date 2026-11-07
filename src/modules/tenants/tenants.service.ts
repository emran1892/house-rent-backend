import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Tenant } from './entities/tenant.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enum/user-role.enum';
import { CreateTenantDto } from './dto/create-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
    private readonly dataSource: DataSource,
  ) {}

  async create(organizationId: string, dto: CreateTenantDto) {
    const tenant = this.tenantRepository.create({
      ...dto,
      organization_id: organizationId,
    });
    return await this.tenantRepository.save(tenant);
  }

  async findAll(organizationId: string) {
    return await this.tenantRepository.find({
      where: { organization_id: organizationId },
      order: { created_at: 'DESC' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const tenant = await this.tenantRepository.findOne({
      where: { id, organization_id: organizationId },
    });
    if (!tenant) {
      throw new NotFoundException('Tenant khuje paoa jayni');
    }
    return tenant;
  }

  // Notun Method: Tenant-er jonno login credentials toiri kora
  async createPortalAccess(
    organizationId: string,
    tenantId: string,
    email: string | undefined,
    plainPassword: string,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tenantRepo = queryRunner.manager.getRepository(Tenant);
      const userRepo = queryRunner.manager.getRepository(User);

      // ১. Tenant ache kina check
      const tenant = await tenantRepo.findOne({
        where: { id: tenantId, organization_id: organizationId },
      });

      if (!tenant) {
        throw new NotFoundException('Tenant khuje paoa jayni');
      }

      if (tenant.user_id) {
        throw new BadRequestException('Ei tenant-er jonno already login account ache');
      }

      const loginEmail = email || tenant.email;
      if (!loginEmail) {
        throw new BadRequestException('Tenant-er email address deya baddhotamulok');
      }

      // ২. Email duplicate kina check
      const existingUser = await userRepo.findOne({ where: { email: loginEmail } });
      if (existingUser) {
        throw new ConflictException('Ei email diye already ekta user account royeche');
      }

      // ৩. Password hash kora
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      // ৪. Users table-e account create (Role: TENANT)
      const user = new User();
      user.organization_id = organizationId;
      user.name = tenant.name;
      user.email = loginEmail;
      user.password_hash = hashedPassword; // Use 'password_hash' or 'password' matching your User entity
      user.phone = tenant.phone ?? undefined;
      user.role = UserRole.TENANT;
      user.is_active = true;

      const savedUser = await userRepo.save(user);

      // ৫. Tenant table-e user_id update kora
      tenant.user_id = savedUser.id;
      tenant.email = loginEmail;
      await tenantRepo.save(tenant);

      await queryRunner.commitTransaction();

      return {
        message: 'Tenant portal access successfully toiri hoyeche',
        credentials: {
          email: savedUser.email,
          role: savedUser.role,
        },
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}