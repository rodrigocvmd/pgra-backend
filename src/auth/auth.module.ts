import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [JwtModule.register({ secret: "chaveSecreta", signOptions: {
    expiresIn: "60m"
  } })],
})
export class AuthModule {}
