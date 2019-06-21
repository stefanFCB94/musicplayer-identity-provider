import { Entity, PrimaryColumn, OneToOne, Column, JoinColumn } from 'typeorm';
import { User } from './User';
import { Gender } from '../../enums/Gender';


@Entity()
export class UserData {

  @PrimaryColumn({ length: 36, nullable: false })
  id: string;

  @OneToOne(type => User, user => user.userData)
  @JoinColumn()
  user: User;

  @Column({ length: 1024, nullable: true })
  profilePicture: string;

  @Column({ type: 'enum', enum: Gender, nullable: true })
  gender: Gender;

  @Column({ length: 255, nullable: true })
  firstname: string;

  @Column({ length: 255, nullable: true })
  lastname: string;

  @Column({ length: 1024, nullable: true })
  mail: string;

}
