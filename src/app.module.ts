// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/shemas/user.schema';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { RefreshToken } from './auth/shemas/refresh-token.schema';
import { SensorModule } from './sensor/sensor.module';
import { SensorData } from './sensor/entities/sensor.entity';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('JWT_SECRET'),
        signOptions: {
          expiresIn: '1h',
        },
      }),
      global: true,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, SensorModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get('DB_HOST'),
          port: +configService.get('DB_PORT'),
          database: configService.get('DB_NAME'),
          username: configService.get('DB_USERNAME'),
          password: configService.get('DB_PASSWORD'),
          entities: [User, RefreshToken, SensorData],
          synchronize: true,
          logging: true,
          retryAttempts: 5,
          retryDelay: 3000,
          connectTimeoutMS: 10000,
        };
      },
      inject: [ConfigService],
    }),
    AuthModule,
    SensorModule,
  ],
})
export class AppModule {}
