import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export enum TimeframeEnum {
  HOURLY = 'hourly',
  DAILY = 'daily',
}

export class SensorQueryDto {
  @ApiProperty({
    description: 'Identifiant du capteur',
    example: 'SMART188',
    enum: ['SMART188', 'SMART189'],
  })
  @IsString()
  @IsNotEmpty()
  sensorId: string;

  @ApiProperty({
    description: 'Type d\'agrégation temporelle',
    enum: TimeframeEnum,
    example: 'hourly',
  })
  @IsEnum(TimeframeEnum)
  timeframe: TimeframeEnum;

  @ApiProperty({
    description: 'Date de début de la période',
    example: '2024-01-01T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  startDate: Date;

  @ApiProperty({
    description: 'Date de fin de la période',
    example: '2024-01-02T00:00:00Z',
  })
  @Type(() => Date)
  @IsDate()
  endDate: Date;
}