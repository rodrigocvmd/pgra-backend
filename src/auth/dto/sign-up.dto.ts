import {
  IsEnum,
  IsString,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '@prisma/client';

export class SignUpDto {
  @IsString()
  name: string;
  @IsEmail()
  email: string;
  @IsString()
  @MinLength(8)
  password: string;
  @IsEnum(UserRole)
  role: string;
}
