import { ConflictException, Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signUp(SignUpDto: SignUpDto) {
    const usuarioEncontrado = await this.prismaService.user.findMany({
      where: {
        email: SignUpDto.email,
      },
    });
    if (usuarioEncontrado.length > 0) {
      throw new ConflictException('Este e-mail já está em uso');
    }
    const hashedPassword = await bcrypt.hash(SignUpDto.password, 10);
    return this.prismaService.user.create({
      data: {
        email: signUpDto.email,
        name: signUpDto.name,
        password: hashedPassword,
        role: signUpDto.role,
      },
    });
  }

  async signIn(SignInDto: SignInDto) {
    // Lógica futura de login
    return 'Esta ação retorna um usuário logado';
  }
}
