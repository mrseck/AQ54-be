import { Body, Controller, Post, Put, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateUserDto } from './dtos/create-user.dto';
import { AdminGuard } from 'src/guards/admin.guard';
import { GetUser } from './decorators/get-user.decorator';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() Credentials: LoginDto) {
    return this.authService.login(Credentials);
  }

  @Post('create-user')
  @UseGuards(AuthGuard, AdminGuard)
  async createUser(
    @GetUser('id') adminId: number,
    @Body() createUserData: CreateUserDto,
  ) {
    return this.authService.createUser(adminId, createUserData)
  }


  @UseGuards(AuthGuard)
  @Put('change-password')
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @Req() req,
  ) {
    return this.authService.changePassword(
      req.userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }
}

