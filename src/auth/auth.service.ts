import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { registerDto } from './dtos/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './shemas/user.schema';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dtos/login.dto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepositoy: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerData: registerDto) {
    const { email, password, username } = registerData;

    const emailOrUsernameExist = await this.userRepositoy.findOne({
      where: [{ email }, { username }],
    });
    if (emailOrUsernameExist) {
      throw new BadRequestException('Email or Username already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepositoy.create({
      username,
      email,
      password: hashedPassword,
    });

    return this.userRepositoy.save(user);
  }

  async login(Credentials: LoginDto) {
    const { email, password } = Credentials;

    const user = await this.userRepositoy.findOne({
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

    return this.generateUserToken(user.id);
  }

  async generateUserToken(userId) {
    const accessToken = this.jwtService.sign({userId}, {expiresIn: '1h' });

    return {accessToken};
  }
}
