import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './shemas/user.schema';
import { RefreshToken } from './shemas/refresh-token.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshToken])
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
