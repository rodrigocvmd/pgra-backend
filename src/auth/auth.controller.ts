import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { SignUpDto } from './dto/sign-up.dto';
import type { AuthRequest } from './types';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiOperation({ summary: 'Registrar um novo usuário' })
  @ApiResponse({
    status: 201,
    description: 'O usuário foi criado com sucesso.',
  })
  @ApiResponse({ status: 409, description: 'O e-mail já está em uso.' })
  @UsePipes(ValidationPipe)
  async signUp(@Body() signUpDto: SignUpDto) {
    return this.authService.signUp(signUpDto);
  }

  @Post('signin')
  @ApiOperation({ summary: 'Realizar login de um usuário' })
  @ApiResponse({
    status: 201,
    description: 'Login bem-sucedido, retorna um token de acesso.',
  })
  @ApiResponse({
    status: 401,
    description: 'Credenciais inválidas.',
  })
  @UsePipes(ValidationPipe)
  async signIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Obter o perfil do usuário autenticado' })
  @ApiResponse({
    status: 200,
    description: 'Retorna os dados do perfil do usuário.',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado.' })
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() request: AuthRequest) {
    return request.user;
  }
}
