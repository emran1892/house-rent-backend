import {
  IsNotEmpty,
  IsUUID,
  Matches,
  IsDateString,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateInvoiceItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @ApiProperty({ example: '24696c52-cb22-4b63-acd3-b8e5b9798572', description: 'Lease agreement ID' })
  @IsNotEmpty()
  @IsUUID()
  lease_id: string;

  @ApiProperty({ example: '2026-11', description: 'Billing period (YYYY-MM)' })
  @IsNotEmpty()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'Billing period must be in YYYY-MM format (e.g., 2026-11)' })
  billing_period: string;

  @ApiProperty({ example: '2026-11-10', description: 'Due date for the invoice (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  due_date: string;

  @ApiProperty({ type: [CreateInvoiceItemDto], description: 'List of invoice items' })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one invoice item is required' })
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}