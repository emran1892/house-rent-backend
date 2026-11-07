import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { UnitsService } from './units.service';
import { CreateUnitDto } from './dto/create-unit.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Units')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('building/:buildingId/units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new unit' })
  @ApiResponse({ status: 201, description: 'Unit created successfully' })
  async create(
    @CurrentUser('organization_id') organizationId: string,
    @Param('buildingId') buildingId: string,
    @Body() dto: CreateUnitDto,
  ) {
    return this.unitsService.create(organizationId, buildingId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all units for a specific building' })
  async findAllByBuilding(
    @CurrentUser('organization_id') organizationId: string,
    @Param('buildingId') buildingId: string,
  ) {
    return this.unitsService.findAllByBuilding(organizationId, buildingId);
  }
}