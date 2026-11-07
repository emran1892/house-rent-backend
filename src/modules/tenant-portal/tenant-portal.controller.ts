import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/decorators/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enum/user-role.enum';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { TenantPortalService } from './tenant-portal.service';

@ApiTags('Tenant Portal')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.TENANT)
@Controller('me')
export class TenantPortalController {
  constructor(private readonly portalService: TenantPortalService) {}

  @Get('my-lease')
  @ApiOperation({ summary: 'Get active flat and lease information for current tenant' })
  @ApiResponse({ status: 200, description: 'Active lease details returned successfully' })
  async getMyLease(@CurrentUser('userId') userId: string) {
    return this.portalService.getMyLease(userId);
  }

  @Get('my-invoices')
  @ApiOperation({ summary: 'List all invoices and due payments for current tenant' })
  @ApiResponse({ status: 200, description: 'Invoices list returned successfully' })
  async getMyInvoices(@CurrentUser('userId') userId: string) {
    return this.portalService.getMyInvoices(userId);
  }

  @Get('my-payments')
  @ApiOperation({ summary: 'List all submitted payments and approval receipts for current tenant' })
  @ApiResponse({ status: 200, description: 'Payments history returned successfully' })
  async getMyPayments(@CurrentUser('userId') userId: string) {
    return this.portalService.getMyPayments(userId);
  }
}