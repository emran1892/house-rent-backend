import { IsNotEmpty, IsString, MinLength, Matches, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOwnerDto {
  @ApiProperty({ example: 'Rahim Properties', description: 'Institution Name' })
  @IsNotEmpty({ message: 'Institution name is required' })
  @IsString()
  organizationName: string;

  @ApiProperty({ example: 'Abdur Rahim', description: 'Owner Name' })
  @IsNotEmpty({ message: 'Owner name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: '01711000000', description: 'Phone Number (for login)' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Please enter a valid Bangladeshi phone number (11 digits)' })
  phone: string;

  @ApiProperty({ example: 'rahim@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email?: string;

  @ApiProperty({ example: 'password123', minLength: 6, description: 'Login Password' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}