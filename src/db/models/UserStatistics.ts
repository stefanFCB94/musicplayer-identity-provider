import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './User';


@Entity()
export class UserStatistics {

  @PrimaryColumn({ length: 36 })
  id: string;

  @OneToOne(type => User, user => user.statistics)
  @JoinColumn()
  user: User;

  @Column({ type: 'integer', unsigned: true, default: 0, nullable: false })
  countSignin: number = 0;

  @Column({ type: 'integer', unsigned: true, default: 0, nullable: false })
  countSignout: number = 0;

  @Column({ type: 'date', nullable: true })
  lastLogin: Date;

  @Column({ type: 'date', nullable: true })
  lastLogout: Date;
}
