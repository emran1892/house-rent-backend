import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RolesGuard } from '../../common/decorators/guards/roles.guard';
import { UserRole } from '../../common/enum/user-role.enum';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard,RolesGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('request')
  @Roles(UserRole.TENANT, UserRole.OWNER)
  @ApiOperation({ summary: 'Tenant request for payment submission' })
  async submitRequest(
    @CurrentUser('organization_id') orgId: string,
    @Body() dto: CreatePaymentDto,
  ) {
    return this.paymentsService.submitPaymentRequest(orgId, dto);
  }

  @Get('pending')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Payment requests pending for admin approval' })
  async getPendingRequests(@CurrentUser('organization_id') orgId: string) {
    return this.paymentsService.findPendingRequests(orgId);
  }

  @Post(':id/approve')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Admin TrxID/Cash verify then approve payment' })
  async approve(
    @CurrentUser('organization_id') orgId: string,
    @Param('id') id: string,
  ) {
    return this.paymentsService.approvePayment(orgId, id);
  }

  @Post(':id/reject')
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'Admin payment request reject with reason' })
  async reject(
    @CurrentUser('organization_id') orgId: string,
    @Param('id') id: string,
    @Body() dto: RejectPaymentDto,
  ) {
    return this.paymentsService.rejectPayment(orgId, id, dto);
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiOperation({ summary: 'List of all payments' })
  async findAll(@CurrentUser('organization_id') orgId: string) {
    return this.paymentsService.findAll(orgId);
  }
}