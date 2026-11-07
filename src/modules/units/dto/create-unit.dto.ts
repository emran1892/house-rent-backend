import {
  IsNotEmpty,
  IsString,
  IsInt,
  IsNumber,
  IsOptional,
  IsArray,
  IsBoolean,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUnitDto {
  @ApiProperty({ example: 'Flat-101', description: 'unique code for the unit' })
  @IsNotEmpty({ message: 'Unit code is required' })
  @IsString()
  code: string;

  @ApiProperty({ example: 1, description: 'কত তলায় অবস্থিত' })
  @IsNotEmpty({ message: 'Floor number is required' })
  @IsInt({ message: 'Floor number must be an integer' })
  @Min(0, { message: 'Ground floor is 0 or greater' })
  floor: number;

  @ApiProperty({ example: 3, description: 'Number of bedrooms' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  bedrooms: number;

  @ApiProperty({ example: 2, description: 'Number of bathrooms' })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  bathrooms: number;

  @ApiProperty({ example: 1250.5, required: false, description: 'Size (square feet)' })
  @IsOptional()
  @IsNumber()
  size_sqft?: number;

  @ApiProperty({ example: 18000, description: 'Monthly base rent (BDT)' })
  @IsNotEmpty({ message: 'Base rent is required' })
  @IsNumber()
  @Min(0)
  base_rent: number;

  @ApiProperty({ example: 36000, required: false, description: 'Advance payment (BDT)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  advance_amount?: number;

  @ApiProperty({ example: ['Lift', 'Generator', 'Balcony'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  facilities?: string[];

  @ApiProperty({ example: true, required: false, description: 'Is the unit listed for rent?' })
  @IsOptional()
  @IsBoolean()
  is_listed?: boolean;
}