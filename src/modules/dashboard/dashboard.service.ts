import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Unit } from '../units/entities/unit.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { Payment } from '../payments/entities/payment.entity';
import { Building } from '../building/entities/building.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { UnitStatus } from '../../common/enum/unit-status.enum';
import { InvoiceStatus } from '../../common/enum/invoice-status.enum';
import { PaymentStatus } from '../../common/enum/payment-status.enum';

@Injectable()
export class DashboardService {
  constructor(private readonly dataSource: DataSource) {}

  async getSummary(organizationId: string) {
    const unitRepo = this.dataSource.getRepository(Unit);
    const invoiceRepo = this.dataSource.getRepository(Invoice);
    const paymentRepo = this.dataSource.getRepository(Payment);
    const buildingRepo = this.dataSource.getRepository(Building);
    const tenantRepo = this.dataSource.getRepository(Tenant);

    // ১. মোট বাড়ি ও মোট ভাড়াটিয়া সংখ্যা
    const totalBuildings = await buildingRepo.count({
      where: { organization_id: organizationId },
    });

    const totalTenants = await tenantRepo.count({
      where: { organization_id: organizationId },
    });

    // ২. ফ্ল্যাট/ইউনিটের হিসাব (Total, Occupied, Vacant)
const units = await unitRepo.find({
      where: { organization_id: organizationId },
      select: {
        id: true,
        status: true,
      },
    });

    const totalUnits = units.length;
    const occupiedUnits = units.filter((u) => u.status === UnitStatus.OCCUPIED).length;
    const vacantUnits = units.filter((u) => u.status === UnitStatus.VACANT).length;
    const occupancyRate = totalUnits > 0 ? ((occupiedUnits / totalUnits) * 100).toFixed(1) : '0';

    // ৩. আর্থিক হিসাব (Total Invoiced, Total Collected, Total Due)
    const invoices = await invoiceRepo.find({
      where: { organization_id: organizationId },
      select: {
        total_amount: true,
        paid_amount: true,
        status: true,
      },
    });

    let totalInvoiced = 0;
    let totalCollected = 0;

    invoices.forEach((inv) => {
      totalInvoiced += Number(inv.total_amount);
      totalCollected += Number(inv.paid_amount);
    });

    const totalDue = totalInvoiced - totalCollected;

    // ৪. সর্বশেষ ৫টি পেমেন্ট
    const recentPayments = await paymentRepo.find({
  where: {
    organization_id: organizationId,
    status: PaymentStatus.APPROVED, // Shudhu approved gulo dashboard-e ashbe
  },
  order: { created_at: 'DESC' },
  take: 5,
  relations: {
    invoice: {
      lease: {
        tenant: true,
        unit: true,
      },
    },
  },
});

    // ৫. সাম্প্রতিক বকেয়া ইনভয়েস (PENDING বা PARTIAL)
    const pendingInvoices = await invoiceRepo.find({
      where: [
        { organization_id: organizationId, status: InvoiceStatus.PENDING },
        { organization_id: organizationId, status: InvoiceStatus.PARTIAL },
      ],
      order: { due_date: 'ASC' },
      take: 5,
      relations: {
        lease: {
          tenant: true,
          unit: true,
        },
      },
    });

    return {
      overview: {
        total_buildings: totalBuildings,
        total_units: totalUnits,
        occupied_units: occupiedUnits,
        vacant_units: vacantUnits,
        occupancy_rate_percentage: `${occupancyRate}%`,
        total_tenants: totalTenants,
      },
      financials: {
        total_invoiced: totalInvoiced,
        total_collected: totalCollected,
        total_due: totalDue,
      },
      recent_payments: recentPayments,
      pending_invoices: pendingInvoices,
    };
  }
}