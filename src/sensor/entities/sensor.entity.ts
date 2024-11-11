import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class SensorData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index()
  sensorId: string;

  @Column('timestamp')
  @Index()
  timestamp: Date;

  @Column('decimal', { precision: 5, scale: 2 })
  temperature: number;

  @Column('decimal', { precision: 5, scale: 2 })
  humidity: number;

  @CreateDateColumn()
  createdAt: Date;
}