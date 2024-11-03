import { BadRequestException, Injectable } from '@nestjs/common';
import { registerDto } from './dtos/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './shemas/user.schema';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(@InjectRepository(User) private readonly userRepositoy: Repository<User>) {}

    async register(registerData: registerDto) {

        const { email, password, username } = registerData;

        const emailOrUsernameExist = await this.userRepositoy.findOne({
            where: [
                { email },
                { username }
            ]
        });
        if (emailOrUsernameExist) {
          throw new BadRequestException('Email or Username already exist')
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = this.userRepositoy.create({
            username,
            email,
            password: hashedPassword,
        });

        return this.userRepositoy.save(user);
       
    }
}
