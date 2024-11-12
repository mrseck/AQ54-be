import { Controller, Get, Param, Query, UseGuards } from "@nestjs/common";
import { SensorService } from "./sensor.service";
import { AuthGuard } from "src/guards/auth.guard";
import { AdminGuard } from "src/guards/admin.guard";
import { SensorData } from "./entities/sensor.entity";

@UseGuards(AuthGuard, AdminGuard)
@Controller('sensor')
export class SensorController {
  constructor(private readonly sensorService: SensorService) {}

  @Get()
  async getSensorData(
    @Query('stationNames') stationNames: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query('granularity') granularity: 'hour' | 'day' = 'day',
  ): Promise<SensorData[]> {
    return this.sensorService.getSensorDataByStationAndDate(
      stationNames,
      new Date(startDate),
      new Date(endDate),
      granularity,
    );
  }
}   