import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, OneToOne, OneToMany } from 'typeorm';
import { UserData } from './UserData';
import { UserStatistics } from './UserStatistics';
import { Token } from './Token';

@Entity()
export class User {

  @PrimaryColumn({ length: 36 })
  id: string;

  @Column({ length: 256, unique: true, nullable: false })
  username: string;

  @Column({ length: 128, nullable: false })
  password: string;

  @Column({ length: 128, nullable: false })
  salt: string;

  @Column({ type: 'boolean', default: false })
  locked = false;

  @CreateDateColumn({ nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ nullable: false })
  updatedAt: Date;

  @OneToMany(token => Token, token => token.user)
  tokens: Token[];

  @OneToOne(type => UserData, userData => userData.user)
  userData: UserData;

  @OneToOne(type => UserStatistics, userStatistics => userStatistics.user)
  statistics: UserStatistics;

}
