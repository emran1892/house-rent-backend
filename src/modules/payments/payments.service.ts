import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Payment } from './entities/payment.entity';
import { Invoice } from '../invoices/entities/invoice.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { RejectPaymentDto } from './dto/reject-payment.dto';
import { PaymentStatus } from '../../common/enum/payment-status.enum';
import { InvoiceStatus } from '../../common/enum/invoice-status.enum';
import { PaymentMethod } from '../../common/enum/payment-method.enum';

@Injectable()
export class PaymentsService {
  constructor(private readonly dataSource: DataSource) {}

  // ১. Tenant request for payment submission
  async submitPaymentRequest(organizationId: string, dto: CreatePaymentDto) {
    const paymentRepo = this.dataSource.getRepository(Payment);
    const invoiceRepo = this.dataSource.getRepository(Invoice);

    // Invoice check
    const invoice = await invoiceRepo.findOne({
      where: { id: dto.invoice_id, organization_id: organizationId },
    });

    if (!invoice) {
      throw new NotFoundException('invoice not found');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      throw new BadRequestException('This invoice is already fully paid.');
    }

    // if online payment, check for transaction reference and duplicates
    if (dto.payment_method !== PaymentMethod.CASH) {
      if (!dto.transaction_reference) {
        throw new BadRequestException('For online payments, transaction reference is required.');
      }

      const duplicateTrx = await paymentRepo.findOne({
        where: {
          organization_id: organizationId,
          payment_method: dto.payment_method,
          transaction_reference: dto.transaction_reference,
        },
      });

      if (duplicateTrx) {
        throw new ConflictException('This transaction reference has already been used for another payment.');
      }
    }

    // Submission er somoy receipt number create hobe na ba draft thakbe
    // Admin approve korar por formal receipt number boshe

    const payment = paymentRepo.create({
      organization_id: organizationId,
      invoice_id: dto.invoice_id,
      receipt_number: `DRAFT-${Date.now()}`,
      amount: dto.amount,
      payment_date: dto.payment_date,
      payment_method: dto.payment_method,
      transaction_reference: dto.transaction_reference ?? undefined,
      note: dto.note ?? undefined,
      status: PaymentStatus.SUBMITTED,
    });

    const savedPayment = await paymentRepo.save(payment);

    return {
      message: 'Payment request safollovabe submit hoyeche. Admin verify kore approve korle receipt paben.',
      payment: savedPayment,
    };
  }

  // ২. Admin dashboard theke TrxID / Cash verify kore Approve korbe
  async approvePayment(organizationId: string, paymentId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const paymentRepo = queryRunner.manager.getRepository(Payment);
      const invoiceRepo = queryRunner.manager.getRepository(Invoice);

      const payment = await paymentRepo.findOne({
        where: { id: paymentId, organization_id: organizationId },
      });

      if (!payment) {
        throw new NotFoundException('Payment request khuje paoa jayni');
      }

      if (payment.status !== PaymentStatus.SUBMITTED) {
        throw new BadRequestException(`Ei payment-ti itimodhe ${payment.status} kora hoyeche`);
      }

      const invoice = await invoiceRepo.findOne({
        where: { id: payment.invoice_id, organization_id: organizationId },
      });

      if (!invoice) {
        throw new NotFoundException('Somporkito invoice khuje paoa jayni');
      }

      const totalAmount = Number(invoice.total_amount);
      const currentPaid = Number(invoice.paid_amount);
      const paymentAmount = Number(payment.amount);
      const remainingDue = totalAmount - currentPaid;

      // Over-payment checking
      if (paymentAmount > remainingDue) {
        throw new BadRequestException(
          `Payment-er poriman bokea takar cheye beshi. Bortoman bokea: ${remainingDue} taka`,
        );
      }

      // Shothik Receipt Number assign kora (Jemon: REC-202611-7392)
      const cleanDate = payment.payment_date.replace(/-/g, '').slice(0, 6);
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      payment.receipt_number = `REC-${cleanDate}-${randomSuffix}`;
      payment.status = PaymentStatus.APPROVED;

      await paymentRepo.save(payment);

      // Invoice update kora
      const updatedPaidAmount = currentPaid + paymentAmount;
      invoice.paid_amount = updatedPaidAmount;
      invoice.status = updatedPaidAmount >= totalAmount ? InvoiceStatus.PAID : InvoiceStatus.PARTIAL;

      await invoiceRepo.save(invoice);

      await queryRunner.commitTransaction();

      return {
        message: 'Payment shofolvabe Approved hoyeche ebong Receipt generate hoyeche',
        receipt_number: payment.receipt_number,
        payment,
        invoice_summary: {
          invoice_number: invoice.invoice_number,
          total_amount: totalAmount,
          paid_amount: updatedPaidAmount,
          remaining_due: totalAmount - updatedPaidAmount,
          status: invoice.status,
        },
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // ৩. Admin jodi dekhe TrxID match koreni ba taka asheni, tokhon Reject korbe
  async rejectPayment(organizationId: string, paymentId: string, dto: RejectPaymentDto) {
    const paymentRepo = this.dataSource.getRepository(Payment);

    const payment = await paymentRepo.findOne({
      where: { id: paymentId, organization_id: organizationId },
    });

    if (!payment) {
      throw new NotFoundException('Payment request khuje paoa jayni');
    }

    if (payment.status !== PaymentStatus.SUBMITTED) {
      throw new BadRequestException('Shudhu SUBMITTED payment-i reject kora jabe');
    }

    payment.status = PaymentStatus.REJECTED;
    payment.rejection_reason = dto.reason;

    await paymentRepo.save(payment);

    return {
      message: 'Payment request reject kora hoyeche',
      payment,
    };
  }

  // ৪. Admin dashboard-e pending request gulor list dekhar jonno
  async findPendingRequests(organizationId: string) {
    return await this.dataSource.getRepository(Payment).find({
      where: {
        organization_id: organizationId,
        status: PaymentStatus.SUBMITTED,
      },
      relations: {
        invoice: {
          lease: {
            tenant: true,
            unit: true,
          },
        },
      },
      order: { created_at: 'ASC' },
    });
  }

  // ৫. Shob payment list
  async findAll(organizationId: string) {
    return await this.dataSource.getRepository(Payment).find({
      where: { organization_id: organizationId },
      relations: {
        invoice: {
          lease: {
            tenant: true,
            unit: true,
          },
        },
      },
      order: { created_at: 'DESC' },
    });
  }
}