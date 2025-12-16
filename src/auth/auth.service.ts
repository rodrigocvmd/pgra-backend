import { UserRole } from '@prisma/client';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

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
        email: SignUpDto.email,
        name: SignUpDto.name,
        passwordHash: hashedPassword,
        role: (SignUpDto.role as UserRole) || 'USER',
      },
    });
  }

  async signIn(SignInDto: SignInDto) {
    try {
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
        loginEncontrado.passwordHash,
      );
      if (!passwordCheck) {
        throw new UnauthorizedException('Usuário ou senha incorretos');
      }
      const payload = {
        sub: loginEncontrado.id,
        email: loginEncontrado.email,
        name: loginEncontrado.name,
        role: loginEncontrado.role,
      };
      const accessToken = this.jwtService.sign(payload);

      return { access_token: accessToken };
    } catch (error) {
      console.error('Error during signIn:', error);
      throw error;
    }
  }
}
