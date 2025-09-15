import { Injectable } from '@nestjs/common';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';

@Injectable()
export class AuthService {
  async signUp(SignUpDto: SignUpDto) {
    // Lógica futura de registro
    return 'Esta ação retorna um novo usuário';
  }

  async signIn(SignInDto: SignInDto) {
    // Lógica futura de login
    return 'Esta ação retorna um usuário logado';
  }
}
