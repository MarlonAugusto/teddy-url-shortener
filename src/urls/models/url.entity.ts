import { UserEntity } from 'src/user/models/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('urls')
export class UrlEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalUrl: string;

  @Column({ unique: true })
  shortUrl: string;

  @Column({ default: 0 })
  clicks: number;

  @ManyToOne(() => UserEntity, (user) => user.urls, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  user?: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn({ nullable: true })
  updatedAt?: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ default: true })
  active: boolean;
}
