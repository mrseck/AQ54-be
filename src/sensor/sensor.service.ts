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

  
  @Cron(CronExpression.EVERY_30_MINUTES)
  async scheduledFetchData() {
    try {
      console.log(`[${new Date().toISOString()}] Starting scheduled data fetch...`);
      
      // Utilisation de Promise.all pour exécuter les requêtes en parallèle
      await Promise.all([
        this.getCurrentValues('SMART188'),
        this.getCurrentValues('SMART189')
      ]);
      
      console.log(`[${new Date().toISOString()}] Scheduled fetch completed`);
    } catch (error) {
      console.error(`[${new Date().toISOString()}] Scheduled fetch failed:`, error);
    }
  }

  async getCurrentValues(stationNames: string) {
    try {
      console.log(`Fetching data for station: ${stationNames}`);
      const response = await lastValueFrom(
        this.httpService.get(`https://airqino-api.magentalab.it/getCurrentValues/${stationNames}`)
      );

      console.log('API Response:', response.data);

      const { station_name, timestamp, values } = response.data;

      if (!values || !Array.isArray(values)) {
        throw new Error(`Invalid values received for station ${stationNames}`);
      }

      const sensorData = new SensorData();
      sensorData.stationName = station_name;
      sensorData.timestamp = new Date(timestamp);

      // Fonction utilitaire pour obtenir la valeur d'un capteur de manière sécurisée
      const getSensorValue = (sensorType: string): number | null => {
        const sensor = values.find((v) => v.sensor === sensorType);
        return sensor ? sensor.value : null;
      };

      // Attribution des valeurs avec gestion des valeurs manquantes
      sensorData.temperature = getSensorValue('extT');
      sensorData.humidity = getSensorValue('rh');
      sensorData.pressure = getSensorValue('pressure'); // Sera null si absent
      sensorData.o3 = getSensorValue('o3');
      sensorData.no2 = getSensorValue('no2');
      sensorData.pm25 = getSensorValue('pm25');
      sensorData.pm10 = getSensorValue('pm10');

      console.log('Prepared sensor data:', sensorData);
      const savedData = await this.sensorDataRepository.save(sensorData);
      console.log('Data saved successfully:', savedData);

      return savedData;
    } catch (error) {
      console.error(`Error processing station ${stationNames}:`, error);
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

  async getSensorDataCount(): Promise<number> {
    const count = await this.sensorDataRepository.count();
    return count * 6;
  }

}