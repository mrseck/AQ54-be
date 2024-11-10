import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { registerDto } from './dtos/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './shemas/user.schema';
import { MoreThanOrEqual, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';
import { RefreshToken } from './shemas/refresh-token.schema';
import { randomUUID } from 'crypto';
import { nanoid } from 'nanoid';
import { ResetToken } from './shemas/reset-token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,

    @InjectRepository(ResetToken)
    private readonly resetRepository: Repository<ResetToken>,

    private jwtService: JwtService,
  ) {}

  async register(registerData: registerDto) {
    const { email, password, username } = registerData;

    const emailOrUsernameExist = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    if (emailOrUsernameExist) {
      throw new BadRequestException('Email or Username already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  async login(Credentials: LoginDto) {
    const { email, password } = Credentials;

    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });
    if (!user) {
      throw new UnauthorizedException(
        'Wrong Email ! please check the Email you provided and try again',
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Wrong Password ! please check the password you provided and try again',
      );
    }

    const tokens = await this.generateUserToken(user.id);

    return {
      ...tokens,
      username: user.username,
    };
  }

  async changePassword(userId, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException(
        'Wrong Password ! please check the password you provided and try again',
      );
    }

    const NewHashedPassword = await bcrypt.hash(newPassword, 12);

    user.password = NewHashedPassword;

    await this.userRepository.save(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({
      where: {
        email,
      },
    });

    if (user) {
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const resetToken = nanoid(64);

      const rstToken = this.resetRepository.create({
        token: resetToken,
        userId: user.id,
        expiryDate,
      });

      await this.userRepository.save(rstToken);
    }

    return { message: 'If this user exist, he will receive an email' };
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        token: refreshToken,
        expiryDate: MoreThanOrEqual(new Date()),
      },
    });

    if (!token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.tokenRepository.remove(token);

    return this.generateUserToken(token.userId);
  }

  async generateUserToken(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refreshToken = randomUUID();

    await this.storeRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async storeRefreshToken(token: string, userId) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 1);

    await this.tokenRepository
      .createQueryBuilder()
      .delete()
      .from(RefreshToken)
      .where('userId = :userId', { userId })
      .execute();

    const newToken = await this.tokenRepository.create({
      token,
      userId,
      expiryDate,
    });

    return this.tokenRepository.save(newToken);
  }
}
