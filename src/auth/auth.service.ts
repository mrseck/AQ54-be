import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
  OnModuleInit,
} from '@nestjs/common';
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
import { MailService } from 'src/services/mail.services';
import { UserRole } from './roles/roles.enum';
import { ConfigService } from '@nestjs/config';

interface CreateUserDto {
  email: string;
  password: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private readonly tokenRepository: Repository<RefreshToken>,

    @InjectRepository(ResetToken)
    private readonly resetRepository: Repository<ResetToken>,

    private jwtService: JwtService,
    private mailService: MailService,
    private configService: ConfigService
  ) {}

  async onModuleInit() {
    await this.createDefaultAdmin();
  }

  private async createDefaultAdmin(): Promise<void> {
    const adminEmail = this.configService.get('ADMIN_EMAIL')
    const adminPassword = this.configService.get('ADMIN_PASSWORD');
    const adminUsername = this.configService.get('ADMIN_USERNAME');

    if (!adminEmail || !adminPassword || !adminUsername) {
      console.warn('Default admin credentials not found in environment variables');
      return;
    }

    const existingAdmin = await this.userRepository.findOne({
      where: [{ email: adminEmail }, { username: adminUsername }],
    });

    if (existingAdmin) {
      console.log('Admin account already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const adminUser = this.userRepository.create({
      username: adminUsername,
      email: adminEmail,
      password: hashedPassword,
      role: UserRole.ADMIN
    });

    await this.userRepository.save(adminUser);
    console.log('Default admin account created successfully');
  }

  async createUser(adminId: number, userData: CreateUserDto) {
    // Vérifier que le créateur est bien un admin
    const admin = await this.userRepository.findOne({
      where: { id: adminId }
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can create new users');
    }

    const { email, password, username, role } = userData;

    // Vérifier si l'email ou le username existe déjà
    const emailOrUsernameExist = await this.userRepository.findOne({
      where: [{ email }, { username }],
    });
    
    if (emailOrUsernameExist) {
      throw new UnauthorizedException('Email or Username already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = this.userRepository.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    return this.userRepository.save(user);
  }

  async login(Credentials: LoginDto) {
    const { email, password } = Credentials;

    const user = await this.userRepository.findOne({
      where: { email },
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
      role: user.role,
      userId: user.id,
    };
  }

  async updateUserRole(adminId: number, userId: number, newRole: UserRole) {
    // Vérifier que le modificateur est bien un admin
    const admin = await this.userRepository.findOne({
      where: { id: adminId }
    });

    if (!admin || admin.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Only administrators can update user roles');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.role = newRole;
    return this.userRepository.save(user);
  }

  // Les autres méthodes restent inchangées...
  async changePassword(userId, oldPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
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

  async generateUserToken(userId) {
    const accessToken = this.jwtService.sign({ userId }, { expiresIn: '1h' });
    const refreshToken = randomUUID();

    await this.storeRefreshToken(refreshToken, userId);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async storeRefreshToken(token: string, userId) {
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