import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshToken } from "./refresh-token.schema";
import { ResetToken } from "./reset-token.schema";

@Entity({ name: 'users'})
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];

    @OneToMany(() => ResetToken, resetToken => resetToken.user)
    resetTokens: ResetToken[];

}
