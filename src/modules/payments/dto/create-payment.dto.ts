import {
  IsNotEmpty,
  IsUUID,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../common/enum/payment-method.enum';

export class CreatePaymentDto {
  @ApiProperty({ example: '3efaf839-76d8-4cd6-90af-5fc9f1cc32ef', description: 'invoice id' })
  @IsNotEmpty()
  @IsUUID()
  invoice_id: string;

  @ApiProperty({ example: 10000, description: 'amount paid' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1, { message: 'পেমেন্ট কমপক্ষে ১ টাকা হতে হবে' })
  amount: number;

  @ApiProperty({ example: '2026-11-05', description: 'payment date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  payment_date: string;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.BKASH, description: 'payment method' })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  @ApiProperty({ example: 'TRX987654321', required: false, description: 'transaction reference or check number' })
  @IsOptional()
  @IsString()
  transaction_reference?: string;

  @ApiProperty({ example: 'BKASH transaction', required: false })
  @IsOptional()
  @IsString()
  note?: string;
}