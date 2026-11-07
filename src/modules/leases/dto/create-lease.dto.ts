import { IsNotEmpty, IsUUID, IsDateString, IsNumber, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLeaseDto {
  @ApiProperty({ example: 'unit-uuid-here', description: 'UUID of the unit being leased' })
  @IsNotEmpty()
  @IsUUID()
  unit_id: string;

  @ApiProperty({ example: 'tenant-uuid-here', description: 'UUID of the tenant signing the lease' })
  @IsNotEmpty()
  @IsUUID()
  tenant_id: string;

  @ApiProperty({ example: '2026-11-01', description: 'UUID of the unit being leased' })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiProperty({ example: '2027-10-31', required: false, description: 'UUID of the unit being leased' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ example: 18000, description: 'UUID of the unit being leased' })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  monthly_rent: number;

  @ApiProperty({ example: 36000, required: false, description: 'UUID of the unit being leased' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  security_deposit?: number;

  @ApiProperty({ example: 5, required: false, description: 'UUID of the unit being leased' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  rent_due_day?: number;
}