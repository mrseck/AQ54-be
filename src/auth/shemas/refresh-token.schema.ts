import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.schema";

@Entity({ name: 'refresh_tokens'}) 
export class RefreshToken {

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', nullable: false })
  token: string;

  @Column({ name: 'user_id', nullable: false })
  userId: string;

  @ManyToOne(() => User, user => user.refreshTokens, {
    onDelete: 'CASCADE'  
  })
  @JoinColumn({ name: 'user_id' })  
  user: User;

  @Column({ name: 'expiry_date', type: 'timestamp', nullable: false })
  expiryDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

}
