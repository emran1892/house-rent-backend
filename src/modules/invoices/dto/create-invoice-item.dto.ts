import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty({ example: 'Monthly Rent', description: 'Bill category or item name' })
  @IsNotEmpty({ message: 'Item name is required' })
  @IsString()
  title: string;

  @ApiProperty({ example: 18000, description: 'Amount' })
  @IsNotEmpty({ message: 'Amount is required' })
  @IsNumber()
  @Min(1, { message: 'Amount must be a positive number' })
  amount: number;
}