import { Decimal } from '@prisma/client/runtime/library';
import { IsNumber, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateResourceDto {
  @IsString()
  @IsNotEmpty()
  name: string;
  @IsString()
  @IsOptional()
  description: string;
  @IsNumber()
  @IsNotEmpty()
  pricePerHour: Decimal;
}
