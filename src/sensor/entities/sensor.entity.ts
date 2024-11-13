import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'sensor_data  ' })
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  stationName: string;

  @Column({ type: 'timestamp' })
  timestamp: Date;

  @Column({ type: 'float', nullable: true })
  temperature: number | null;

  @Column({ type: 'float', nullable: true })
  humidity: number | null;

  @Column({ type: 'float', nullable: true })
  pressure: number | null;

  @Column({ type: 'float', nullable: true })
  o3: number | null;

  @Column({ type: 'float', nullable: true })
  no2: number | null;

  @Column({ type: 'float', nullable: true })
  pm25: number | null;

  @Column({ type: 'float', nullable: true })
  pm10: number | null;
}
