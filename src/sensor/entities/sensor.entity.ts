import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sensor_data  ' })
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stationName: string;

  @Column('float')
  temperature: number;

  @Column('float')
  humidity: number;

  @Column('float')
  pressure: number;

  @Column('float')
  o3: number;

  @Column('float')
  no2: number;

  @Column('float')
  pm25: number;

  @Column('float')
  pm10: number;

  @Column()
  timestamp: Date;
}
