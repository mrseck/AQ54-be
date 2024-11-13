import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SensorController } from './sensor.controller';
import { SensorService } from './sensor.service';
import { SensorData } from './entities/sensor.entity';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { SchedulerService } from './scheduler/scheduler.service';
import { SchedulerController } from './scheduler/scheduler.controller';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([SensorData]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SensorController, SchedulerController],
  providers: [SensorService, SchedulerService],
})
export class SensorModule {}
