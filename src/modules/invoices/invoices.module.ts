import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invoice } from './entities/invoice.entity';
import { InvoiceItem } from './entities/invoice-item.entity';
import { InvoicesService } from  './invoice.service';
import { InvoicesController } from './invoices.controller';
import { InvoicesScheduler } from './invoices.scheduler';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem])],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoicesScheduler],
  exports: [InvoicesService],
})
export class InvoicesModule {}