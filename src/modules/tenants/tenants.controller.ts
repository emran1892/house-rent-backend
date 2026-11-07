import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { CreateTenantPortalUserDto } from './dto/create-tenant-portal-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/decorators/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enum/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Tenants')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  // Create a new tenant profile (Owner only)
  @Post()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create a new tenant profile' })
  @ApiResponse({ status: 201, description: 'Tenant profile created successfully' })
  async create(
    @CurrentUser('organization_id') organizationId: string,
    @Body() dto: CreateTenantDto,
  ) {
    return this.tenantsService.create(organizationId, dto);
  }

  // Retrieve all tenant records for the organization
  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'List all tenants' })
  @ApiResponse({ status: 200, description: 'Retrieved tenant list successfully' })
  async findAll(@CurrentUser('organization_id') organizationId: string) {
    return this.tenantsService.findAll(organizationId);
  }

  // Retrieve a specific tenant profile by ID
  @Get(':id')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'View a specific tenant profile' })
  @ApiResponse({ status: 200, description: 'Retrieved tenant profile successfully' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  async findOne(
    @CurrentUser('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.tenantsService.findOne(organizationId, id);
  }

  // Provision portal access credentials for an existing tenant
  @Post(':id/create-portal-access')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Create login credentials for tenant portal access' })
  @ApiResponse({ status: 201, description: 'Tenant portal user account created successfully' })
  @ApiResponse({ status: 400, description: 'Tenant already has a portal user or missing required fields' })
  @ApiResponse({ status: 404, description: 'Tenant not found' })
  @ApiResponse({ status: 409, description: 'Email already in use by another user' })
  async createPortalAccess(
    @CurrentUser('organization_id') organizationId: string,
    @Param('id') id: string,
    @Body() dto: CreateTenantPortalUserDto,
  ) {
    return this.tenantsService.createPortalAccess(
      organizationId,
      id,
      dto.email,
      dto.password,
    );
  }
}