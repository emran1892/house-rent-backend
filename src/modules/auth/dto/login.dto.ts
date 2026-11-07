import { IsNotEmpty, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: '01711000000', description: 'Phone Number (for login)' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^01[3-9]\d{8}$/, { message: 'Please enter a valid Bangladeshi phone number (11 digits)' })
  phone: string;

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}