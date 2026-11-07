import { IsNotEmpty, IsString, IsOptional, Matches, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiProperty({ example: 'Ibn Taimiya', description: 'Tenant\'s name' })
  @IsNotEmpty({ message: 'Tenant\'s name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: '01812345678', description: 'Tenant\'s phone number' })
  @IsNotEmpty({ message: 'Tenant\'s phone number is required' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Please enter a valid 11-digit phone number' })
  phone: string;

  @ApiProperty({ example: 'kamal@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiProperty({ example: '19951234567890', required: false, description: 'National ID or Passport number' })
  @IsOptional()
  @IsString()
  nid_passport?: string;

  @ApiProperty({ example: '01711223344', required: false, description: 'Emergency contact number' })
  @IsOptional()
  @Matches(/^01[3-9]\d{8}$/, { message: 'Please enter a valid 11-digit emergency contact number' })
  emergency_contact?: string;

  @ApiProperty({ example: 'village: charpada, upazila: sadar, district: bogra', required: false })
  @IsOptional()
  @IsString()
  permanent_address?: string;
}