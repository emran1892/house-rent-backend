import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoicesService } from './invoice.service';

@Injectable()
export class InvoicesScheduler {
  private readonly logger = new Logger(InvoicesScheduler.name);

  constructor(private readonly invoicesService: InvoicesService) {}

  // প্রতি মাসের ১ তারিখে রাত ১২:০১ মিনিটে রান হবে
  // ক্রন প্যাটার্ন: সেকেন্ড মিনিট ঘণ্টা দিন মাস বার (0 1 0 1 * *)
  @Cron('0 1 0 1 * *')
  async handleMonthlyInvoiceGeneration() {
    this.logger.log('Automatically generating monthly invoices...');
    try {
      const result = await this.invoicesService.generateMonthlyInvoicesForActiveLeases();
      this.logger.log(
        `${result.billingPeriod} Total for  ${result.generatedCount} successful invoice generations.`,
      );
    } catch (error) {
      this.logger.error('Error occurred while generating invoices', error);
    }
  }
}