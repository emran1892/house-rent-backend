import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { InvoicesService } from './invoice.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Invoices')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'New Invoice Creation' })
  @ApiResponse({ status: 201, description: 'Invoice created successfully' })
  async create(
    @CurrentUser('organization_id') organizationId: string,
    @Body() dto: CreateInvoiceDto,
  ) {
    return this.invoicesService.create(organizationId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get All Invoices' })
  async findAll(@CurrentUser('organization_id') organizationId: string) {
    return this.invoicesService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Invoice by ID' })
  async findOne(
    @CurrentUser('organization_id') organizationId: string,
    @Param('id') id: string,
  ) {
    return this.invoicesService.findOne(organizationId, id);
  }
}