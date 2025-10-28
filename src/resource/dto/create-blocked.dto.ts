import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateBlockedDto {
  @IsNotEmpty()
  @IsDateString()
  blockedStart: Date;

  @IsNotEmpty()
  @IsDateString()
  blockedEnd: Date;

  @IsNotEmpty()
  @IsString()
  reason: string;
}
