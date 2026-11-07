import { IsNotEmpty, IsString, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBuildingDto {
  @ApiProperty({ example: 'Zamzam Tower', description: 'House Name' })
  @IsNotEmpty({ message: 'House name is required' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Road 5, Block B, Mirpur-2, Dhaka', description: 'Full Address' })
  @IsNotEmpty({ message: 'Address is required' })
  @IsString()
  address: string;

  @ApiProperty({ example: 6, description: 'Total Number of Floors' })
  @IsNotEmpty({ message: 'Number of floors is required' })
  @IsInt({ message: 'Number of floors must be an integer' })
  @Min(1, { message: 'At least 1 floor is required' })
  floors_count: number;
}