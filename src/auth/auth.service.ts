import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
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
    const loginEncontrado = await this.prismaService.user.findUnique({
      where: {
        email: SignInDto.email,
      },
    });
    if (!loginEncontrado) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }
    const passwordCheck = await bcrypt.compare(
      SignInDto.password,
      loginEncontrado.password,
    );
    if (!passwordCheck) {
      throw new UnauthorizedException('Usuário ou senha incorretos');
    }
    return user;
  }
}
