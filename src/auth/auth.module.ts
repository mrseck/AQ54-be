import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './shemas/user.schema';
import { RefreshToken } from './shemas/refresh-token.schema';
import { MailService } from 'src/services/mail.services';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken])
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService],
})
export class AuthModule {}
