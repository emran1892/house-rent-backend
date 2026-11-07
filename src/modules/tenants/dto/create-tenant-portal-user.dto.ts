import { IsNotEmpty, IsString, MinLength, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTenantPortalUserDto {
  @ApiProperty({ example: 'tenant@example.com', required: false })
  @IsOptional()
  @IsEmail({}, { message: 'Enter a valid email address' })
  email?: string;

  @ApiProperty({ example: '12345678', minLength: 6 })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}