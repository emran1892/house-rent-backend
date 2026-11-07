import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { Lease } from '../leases/entities/lease.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '../../common/enum/invoice-status.enum';
import { LeaseStatus } from '../../common/enum/lease-status.enum';

@Injectable()
export class InvoicesService {
  constructor(private readonly dataSource: DataSource) {}

  // ১. নতুন ইনভয়েস তৈরি করা (Transaction সহ)
  async create(organizationId: string, dto: CreateInvoiceDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const leaseRepo = queryRunner.manager.getRepository(Lease);
      const invoiceRepo = queryRunner.manager.getRepository(Invoice);
      const invoiceItemRepo = queryRunner.manager.getRepository(InvoiceItem);

      // লিজ চুক্তিটি এই প্রতিষ্ঠানের কি না তা যাচাই
      const lease = await leaseRepo.findOne({
        where: { id: dto.lease_id, organization_id: organizationId },
      });

      if (!lease) {
        throw new NotFoundException('No Lease agreement found');
      }

      // একই মাসে ইতিমধ্যে কোনো ইনভয়েস আছে কি না তা যাচাই
      const existingInvoice = await invoiceRepo.findOne({
        where: {
          organization_id: organizationId,
          lease_id: dto.lease_id,
          billing_period: dto.billing_period,
        },
      });

      if (existingInvoice) {
        throw new ConflictException(`${dto.billing_period} already has an invoice for this lease`);
      }

      // সব আইটেম যোগ করে মোট টাকা হিসাব
      const totalAmount = dto.items.reduce((sum, item) => sum + Number(item.amount), 0);

      // ইউনিক ইনভয়েস নম্বর জেনারেশন (যেমন: INV-202611-3829)
      const cleanPeriod = dto.billing_period.replace('-', '');
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const invoiceNumber = `INV-${cleanPeriod}-${randomSuffix}`;

      // ইনভয়েস অবজেক্ট তৈরি
      const invoice = invoiceRepo.create({
        organization_id: organizationId,
        lease_id: dto.lease_id,
        invoice_number: invoiceNumber,
        billing_period: dto.billing_period,
        due_date: dto.due_date,
        total_amount: totalAmount,
        paid_amount: 0,
        status: InvoiceStatus.PENDING,
      });

      const savedInvoice = await invoiceRepo.save(invoice);

      // আইটেমগুলো ইনভয়েস আইডির সাথে সংরক্ষণ
      const invoiceItems = dto.items.map((item) =>
        invoiceItemRepo.create({
          invoice_id: savedInvoice.id,
          title: item.title,
          amount: item.amount,
        }),
      );

      await invoiceItemRepo.save(invoiceItems);

      await queryRunner.commitTransaction();

      // তৈরি হওয়া পুরো ইনভয়েস আইটেমসহ ফেরত দেওয়া
      return await this.findOne(organizationId, savedInvoice.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ২. প্রতিষ্ঠানের সব ইনভয়েসের তালিকা
  async findAll(organizationId: string) {
    const invoiceRepo = this.dataSource.getRepository(Invoice);
    return await invoiceRepo.find({
      where: { organization_id: organizationId },
      relations: {
        items: true,
        lease: {
          tenant: true,
          unit: {
            building: true,
          },
        },
      },
      order: { created_at: 'DESC' },
    });
  }

  // ৩. নির্দিষ্ট একটি ইনভয়েসের বিস্তারিত তথ্য
  async findOne(organizationId: string, id: string) {
    const invoiceRepo = this.dataSource.getRepository(Invoice);
    const invoice = await invoiceRepo.findOne({
      where: { id, organization_id: organizationId },
      relations: {
        items: true,
        lease: {
          tenant: true,
          unit: {
            building: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('invoice not found');
    }

    return invoice;
  }

 

// InvoicesService ক্লাসের ভেতর যুক্ত করুন:
async generateMonthlyInvoicesForActiveLeases() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const billingPeriod = `${year}-${month}`; // যেমন: '2026-11'

  const leaseRepo = this.dataSource.getRepository(Lease);
  const invoiceRepo = this.dataSource.getRepository(Invoice);
  const invoiceItemRepo = this.dataSource.getRepository(InvoiceItem);

  // ১. সব সক্রিয় লিজ খুঁজে নেওয়া
  const activeLeases = await leaseRepo.find({
    where: { status: LeaseStatus.ACTIVE },
  });

  let generatedCount = 0;

  for (const lease of activeLeases) {
    // ২. এই লিজের জন্য এই মাসে বিল ইতিমধ্যে আছে কি না যাচাই
    const existing = await invoiceRepo.findOne({
      where: {
        lease_id: lease.id,
        billing_period: billingPeriod,
      },
    });

    if (existing) {
      continue; // ইতিমধ্যে বিল থাকলে স্কিপ করবে
    }

    // ৩. ডিউ ডেট নির্ধারণ (লিজের rent_due_day অনুযায়ী)
    const dueDay = String(lease.rent_due_day || 5).padStart(2, '0');
    const dueDate = `${billingPeriod}-${dueDay}`;

    // ৪. ইউনিক ইনভয়েস নম্বর তৈরি
    const cleanPeriod = billingPeriod.replace('-', '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const invoiceNumber = `INV-${cleanPeriod}-${randomSuffix}`;

    const totalRent = Number(lease.monthly_rent);

    const invoice = invoiceRepo.create({
      organization_id: lease.organization_id,
      lease_id: lease.id,
      invoice_number: invoiceNumber,
      billing_period: billingPeriod,
      due_date: dueDate,
      total_amount: totalRent,
      paid_amount: 0,
      status: InvoiceStatus.PENDING,
    });

    const savedInvoice = await invoiceRepo.save(invoice);

    // মূল ফ্ল্যাট ভাড়ার আইটেম সংরক্ষণ
    const item = invoiceItemRepo.create({
      invoice_id: savedInvoice.id,
      title: `${billingPeriod} মাসের ফ্ল্যাট ভাড়া`,
      amount: totalRent,
    });
    await invoiceItemRepo.save(item);

    generatedCount++;
  }

  return { billingPeriod, generatedCount };
}
}