import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SensorData } from './entities/sensor.entity';
import { SensorQueryDto, TimeframeEnum } from './dtos/sensor-query.dto';
import axios from 'axios';

@Injectable()
export class SensorService {
  constructor(
    @InjectRepository(SensorData)
    private sensorRepository: Repository<SensorData>,
  ) {}

  async fetchDataFromAirgino(sensorId: string, startDate: Date, endDate: Date) {
    try {
      const response = await axios.get(`https://airgino-api.magentalab.it/...`, {
        params: {
          sensorId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        headers: {
          'Authorization': `Bearer ${process.env.AIRGINO_API_KEY}`,
        },
      });
      
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Erreur lors de la récupération des données Airgino',
        HttpStatus.BAD_GATEWAY,
      );
    }
  }

  async aggregateData(query: SensorQueryDto) {
    const queryBuilder = this.sensorRepository.createQueryBuilder('sensor_data');

    // Base de la requête
    queryBuilder
      .where('sensor_data.sensorId = :sensorId', { sensorId: query.sensorId })
      .andWhere('sensor_data.timestamp BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });

    // Agrégation selon le timeframe
    if (query.timeframe === TimeframeEnum.HOURLY) {
      queryBuilder
        .select([
          'DATE_TRUNC(\'hour\', sensor_data.timestamp) as timestamp',
          'AVG(sensor_data.temperature) as temperature',
          'AVG(sensor_data.humidity) as humidity',
        ])
        .groupBy('DATE_TRUNC(\'hour\', sensor_data.timestamp)');
    } else {
      queryBuilder
        .select([
          'DATE_TRUNC(\'day\', sensor_data.timestamp) as timestamp',
          'AVG(sensor_data.temperature) as temperature',
          'AVG(sensor_data.humidity) as humidity',
        ])
        .groupBy('DATE_TRUNC(\'day\', sensor_data.timestamp)');
    }

    queryBuilder.orderBy('timestamp', 'ASC');

    return queryBuilder.getRawMany();
  }

  async syncData(sensorId: string, startDate: Date, endDate: Date) {
    const data = await this.fetchDataFromAirgino(sensorId, startDate, endDate);
    
    // Transformation et sauvegarde des données
    const sensorDataEntities = data.map(item => 
      this.sensorRepository.create({
        sensorId,
        timestamp: new Date(item.timestamp),
        temperature: item.temperature,
        humidity: item.humidity,
      })
    );

    await this.sensorRepository.save(sensorDataEntities);
    return sensorDataEntities;
  }
}