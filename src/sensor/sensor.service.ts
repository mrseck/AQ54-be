import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SensorData } from './entities/sensor.entity';
import { Repository } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class SensorService {

  constructor(
    @InjectRepository(SensorData)
    private sensorDataRepository: Repository<SensorData>,
    private readonly httpService: HttpService,
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async refreshSensorData() {
    try {
      await this.getCurrentValues('SMART188');
      await this.getCurrentValues('SMART189');
    } catch (error) {
      console.error('Error refreshing sensor data:', error);
    }
  }

  async getCurrentValues(stationNames: string) {

    try {

      const response = await lastValueFrom(
        this.httpService.get(`https://airqino-api.magentalab.it/getCurrentValues/${stationNames}`)
      );
  
      const { station_name, timestamp, values } = response.data;

      const sensorData = new SensorData();
      sensorData.stationName = station_name;
      sensorData.timestamp = new Date(timestamp);
      sensorData.temperature = values.find((v) => v.sensor === 'extT').value;
      sensorData.humidity = values.find((v) => v.sensor === 'rh').value;
      sensorData.pressure = values.find((v) => v.sensor === 'pressure').value;
      sensorData.o3 = values.find((v) => v.sensor === 'o3').value;
      sensorData.no2 = values.find((v) => v.sensor === 'no2').value;
      sensorData.pm25 = values.find((v) => v.sensor === 'pm25').value;
      sensorData.pm10 = values.find((v) => v.sensor === 'pm10').value;

      await this.sensorDataRepository.save(sensorData);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      // Gestion des erreurs
      throw error;
    } 

  }

  async getSensorDataByStationAndDate(stationName: string, startDate: Date, endDate: Date, granularity: 'hour' | 'day'): Promise<SensorData[]> {
    const queryBuilder = this.sensorDataRepository.createQueryBuilder('sensorData');
    queryBuilder
      .where('sensorData.stationName IN (:...stationNames)', { stationNames: ['SMART188', 'SMART189'] })
      .andWhere('sensorData.timestamp >= :startDate', { startDate })
      .andWhere('sensorData.timestamp <= :endDate', { endDate });
  
    if (granularity === 'hour') {
      queryBuilder.select([
        'DATE_TRUNC(\'hour\', sensorData.timestamp) AS timestamp',
        'AVG(sensorData.temperature) AS temperature',
        'AVG(sensorData.humidity) AS humidity',
        'AVG(sensorData.pressure) AS pressure',
        'AVG(sensorData.o3) AS o3',
        'AVG(sensorData.no2) AS no2',
        'AVG(sensorData.pm25) AS pm25',
        'AVG(sensorData.pm10) AS pm10',
      ]);
      queryBuilder.groupBy('DATE_TRUNC(\'hour\', sensorData.timestamp)');
    } else {
      queryBuilder.select([
        'DATE_TRUNC(\'day\', sensorData.timestamp) AS timestamp',
        'AVG(sensorData.temperature) AS temperature',
        'AVG(sensorData.humidity) AS humidity',
        'AVG(sensorData.pressure) AS pressure',
        'AVG(sensorData.o3) AS o3',
        'AVG(sensorData.no2) AS no2',
        'AVG(sensorData.pm25) AS pm25',
        'AVG(sensorData.pm10) AS pm10',
      ]);
      queryBuilder.groupBy('DATE_TRUNC(\'day\', sensorData.timestamp)');
    }
  
    return queryBuilder.getRawMany();
  }

}