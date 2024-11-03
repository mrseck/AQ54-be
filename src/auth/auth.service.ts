import {
  BadRequestException,
  Injectable,
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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(RefreshToken) private readonly tokenRepository: Repository<RefreshToken>,
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
    }
  }

  async refreshTokens(refreshToken: string) {
    const token = await this.tokenRepository.findOne({
      where: {
        token: refreshToken,
        expiryDate: MoreThanOrEqual(new Date())
      }
    });

    if (!token) {
      throw new UnauthorizedException("Invalid refresh token");
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
      .where("userId = :userId", { userId })
      .execute();

    const newToken = await this.tokenRepository.create({ token, userId, expiryDate });

    return this.tokenRepository.save(newToken);
  }
}
