import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignUpDto {
  @ApiProperty({
    description: 'O endereço de e-mail para o novo usuário',
    example: 'jane.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'O nome do novo usuário',
    example: 'Jane Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'A senha para o novo usuário (mínimo de 8 caracteres)',
    example: 'strongPassword!@#',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}
