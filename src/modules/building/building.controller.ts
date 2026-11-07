import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { BuildingsService } from './building.service';
import { CreateBuildingDto } from './dto/create-building.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Buildings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('buildings')
export class BuildingsController {
  constructor(private readonly buildingsService: BuildingsService) {}
 @Get('public/to-let/:slug')
  @ApiOperation({ summary: 'পাবলিক টু-লেট পেজের জন্য খালি ফ্ল্যাট ও যোগাযোগের তথ্য' })
  @ApiResponse({ status: 200, description: 'খালি ফ্ল্যাটের তালিকা সফলভাবে পাওয়া গেছে' })
  async getPublicToLet(@Param('slug') slug: string) {
    return this.buildingsService.getPublicToLetDetails(slug);
  } 
  
  @Post()
  @ApiOperation({ summary: 'Create a new building' })
  @ApiResponse({ status: 201, description: 'Building created successfully' })
  async create(
    @CurrentUser('organization_id') organizationId: string,
    @Body() dto: CreateBuildingDto,
  ) {
    return this.buildingsService.create(organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all buildings for an organization' })
  async findAll(@CurrentUser('organization_id') organizationId: string) {
    return this.buildingsService.findAll(organizationId);
  }


 
  
  @Get(':id')
  @ApiOperation({ summary: 'Get a specific building' })
  async findOne(
    @CurrentUser('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.buildingsService.findOne(organizationId, id);
  }
}