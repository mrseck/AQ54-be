import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { registerDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshTokenDto } from './dtos/refresh-token.dto';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async signUp(@Body() registerData: registerDto) {
    return this.authService.register(registerData);
  }

  @Post('login')
  async login(@Body() Credentials: LoginDto) {
    return this.authService.login(Credentials);
  }

  @Post('refresh')
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken)
  }
}
