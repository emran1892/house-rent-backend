import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import { LoginDto } from './dto/login.dto';
import { Organization } from '../organizations/entities/organization.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enum/user-role.enum';

@Injectable()
export class AuthService {
  constructor(
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  // 1. new owner registration method (transactional)
  async registerOwner(dto: RegisterOwnerDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const userRepository = queryRunner.manager.getRepository(User);
      const organizationRepository = queryRunner.manager.getRepository(Organization);

      // check if the phone number is already registered
      const existingUser = await userRepository.findOne({ where: { phone: dto.phone } });
      if (existingUser) {
        throw new ConflictException('This phone number is already registered. Please use a different phone number.');
      }

      // স্লাগ (slug) তৈরি করা (যেমন: Rahim Properties -> rahim-properties-xxxx)
      const baseSlug = dto.organizationName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      const uniqueSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;

      // 1. Organization
      const organization = organizationRepository.create({
        name: dto.organizationName,
        slug: uniqueSlug,
        plan: 'FREE',
      });
      const savedOrg = await organizationRepository.save(organization);

      // 2. password hashing
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(dto.password, saltRounds);

      // 3. User creation (Role: OWNER)
      const user = userRepository.create({
        organization_id: savedOrg.id,
        name: dto.name,
        phone: dto.phone,
        email: dto.email,
        password_hash: passwordHash,
        role: UserRole.OWNER,
        is_active: true,
      });
      await userRepository.save(user);

      // ট্রানজ্যাকশন সফল হলে ডেটা স্থায়ী করা
      await queryRunner.commitTransaction();

      return {
        message: 'মালিক ও প্রতিষ্ঠান সফলভাবে তৈরি হয়েছে',
        organization: { id: savedOrg.id, name: savedOrg.name, slug: savedOrg.slug },
        user: { id: user.id, name: user.name, phone: user.phone, role: user.role },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ২. লগইন মেথড (JWT Token ফেরত দেবে)
  async login(dto: LoginDto) {
    const userRepository = this.dataSource.getRepository(User);

    // পাসওয়ার্ড হ্যাশ ফিল্ডটি নরমালি হিডেন থাকে, তাই addSelect দিয়ে আনা হলো
    const user = await userRepository
      .createQueryBuilder('user')
      .addSelect('user.password_hash')
      .where('user.phone = :phone', { phone: dto.phone })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়');
    }

    // পাসওয়ার্ড যাচাই করা
    const isPasswordValid = await bcrypt.compare(dto.password, user.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('ফোন নম্বর বা পাসওয়ার্ড সঠিক নয়');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('আপনার অ্যাকাউন্টটি নিষ্ক্রিয় করা আছে');
    }

    // লগইনের সময় আপডেট করা
    await userRepository.update(user.id, { last_login_at: new Date() });

    // JWT Payload
    const payload = {
      sub: user.id,
      phone: user.phone,
      role: user.role,
      organization_id: user.organization_id,
    };

    return {
      accessToken: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        organization_id: user.organization_id,
      },
    };
  }
}