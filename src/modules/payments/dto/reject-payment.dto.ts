import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectPaymentDto {
  @ApiProperty({ example: 'TrxID not found', description: 'Reject korar karon' })
  @IsNotEmpty({ message: 'Reject reason is required' })
  @IsString()
  reason: string;
}