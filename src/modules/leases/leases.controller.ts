import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { LeasesService } from './leases.service';
import { CreateLeaseDto } from './dto/create-lease.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leases')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leases')
export class LeasesController {
  constructor(private readonly leasesService: LeasesService) {}

  @Post()
  @ApiOperation({ summary: 'new lease check' })
  @ApiResponse({ status: 201, description: 'aggriment successful' })
  async create(
    @CurrentUser('organization_id') organizationId: string,
    @Body() dto: CreateLeaseDto,
  ) {
    return this.leasesService.create(organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'all leases' })
  async findAll(@CurrentUser('organization_id') organizationId: string) {
    return this.leasesService.findAll(organizationId);
  }
}