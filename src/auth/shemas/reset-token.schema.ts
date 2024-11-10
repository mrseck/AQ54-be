import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.schema';

@Entity({ name: 'reset_tokens' })
export class ResetToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  token: string;

  @Column({ name: 'user_id', nullable: false })
  userId: number;

  @ManyToOne(() => User, (user) => user.resetTokens, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: false })
  expiryDate: Date;

  @Column({ name: 'used', nullable: false})
  used: boolean

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
