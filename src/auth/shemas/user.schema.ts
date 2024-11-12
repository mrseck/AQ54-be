import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshToken } from "./refresh-token.schema";
import { UserRole } from "../roles/roles.enum";

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

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.USER
    })
    role: UserRole;

    @OneToMany(() => RefreshToken, refreshToken => refreshToken.user)
    refreshTokens: RefreshToken[];

}
