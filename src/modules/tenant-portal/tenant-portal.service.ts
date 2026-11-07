import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Lease } from '../leases/entities/lease.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { LeaseStatus } from '../../common/enum/lease-status.enum';

@Injectable()
export class TenantPortalService {
  constructor(private readonly dataSource: DataSource) {}

  // Helper: Token-er userId theke tenant profile khuje ber kora
  private async getTenantByUserId(userId: string): Promise<Tenant> {
    const tenantRepo = this.dataSource.getRepository(Tenant);
    const tenant = await tenantRepo.findOne({
      where: { user_id: userId },
    });

    if (!tenant) {
      throw new NotFoundException('Ei user-er shathe kono tenant profile link kora nei');
    }

    return tenant;
  }

  // ১. Nijer active flat ebong contract-er details dekha
  async getMyLease(userId: string) {
    const tenant = await this.getTenantByUserId(userId);
    const leaseRepo = this.dataSource.getRepository(Lease);

    const activeLease = await leaseRepo.findOne({
      where: {
        tenant_id: tenant.id,
        status: LeaseStatus.ACTIVE,
      },
      relations: {
        unit: {
          building: true,
        },
      },
    });

    if (!activeLease) {
      throw new NotFoundException('Apnar kono active lease contract khuje paoa jayni');
    }

    return {
      lease_id: activeLease.id,
      status: activeLease.status,
      monthly_rent: activeLease.monthly_rent,
      security_deposit: activeLease.security_deposit,
      rent_due_day: activeLease.rent_due_day,
      start_date: activeLease.start_date,
      unit: {
        id: activeLease.unit?.id,
        code: activeLease.unit?.code,
        floor: activeLease.unit?.floor,
        size_sqft: activeLease.unit?.size_sqft,
        bedrooms: activeLease.unit?.bedrooms,
        bathrooms: activeLease.unit?.bathrooms,
      },
      building: {
        id: activeLease.unit?.building?.id,
        name: activeLease.unit?.building?.name,
        address: activeLease.unit?.building?.address,
      },
    };
  }

  // ২. Nijer shob invoices ba bills dekha
  async getMyInvoices(userId: string) {
    const tenant = await this.getTenantByUserId(userId);
    const invoiceRepo = this.dataSource.getRepository(Invoice);

    const invoices = await invoiceRepo.find({
      where: {
        lease: {
          tenant_id: tenant.id,
        },
      },
      relations: {
        items: true,
      },
      order: {
        due_date: 'DESC',
      },
    });

    return invoices.map((inv) => {
      const total = Number(inv.total_amount);
      const paid = Number(inv.paid_amount);
      return {
        id: inv.id,
        invoice_number: inv.invoice_number,
        billing_period: inv.billing_period,
        due_date: inv.due_date,
        total_amount: total,
        paid_amount: paid,
        remaining_due: total - paid,
        status: inv.status,
        items: inv.items.map((item) => ({
          id: item.id,
          title: item.title,
          amount: item.amount,
        })),
      };
    });
  }

  // ৩. Nijer shob payment submissions ebong status dekha
  async getMyPayments(userId: string) {
    const tenant = await this.getTenantByUserId(userId);
    const paymentRepo = this.dataSource.getRepository(Payment);

    const payments = await paymentRepo.find({
      where: {
        invoice: {
          lease: {
            tenant_id: tenant.id,
          },
        },
      },
      relations: {
        invoice: true,
      },
      order: {
        created_at: 'DESC',
      },
    });

    return payments.map((pay) => ({
      id: pay.id,
      receipt_number: pay.receipt_number,
      amount: pay.amount,
      payment_date: pay.payment_date,
      payment_method: pay.payment_method,
      transaction_reference: pay.transaction_reference,
      status: pay.status,
      rejection_reason: pay.rejection_reason,
      invoice_number: pay.invoice?.invoice_number,
    }));
  }
}