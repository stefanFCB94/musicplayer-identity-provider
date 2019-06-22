import { Entity, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';


@Entity()
export class Token {

  @PrimaryColumn({ type: 'varchar', length: 256, nullable: false })
  accessToken: string;

  @Column({ type: 'date', nullable: false })
  accessTokenExpires: Date;

  @Column({ type: 'varchar', length: 256, nullable: false })
  refreshToken: string;

  @Column({ type: 'date', nullable: false })
  refreshTokenExpires: Date;

  @Column({ type: 'boolean', nullable: null, default: false })
  locked = false;

  @ManyToOne(type => User, user => user.tokens, { nullable: false, onDelete: 'CASCADE' })
  user: User;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
