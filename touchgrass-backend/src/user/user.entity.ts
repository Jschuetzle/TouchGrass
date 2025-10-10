import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Follow } from '../friends/friend.entity';

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'varchar', length: 128 })
  id: string;

  @Column({ length: 32, unique: true })
  username: string;

  @Column({ length: 32, nullable: true })
  firstname: string;

  @Column({ length: 32, nullable: true })
  lastname: string;

  @Column({ length: 64, nullable: true })
  email: string;

  @Column({ length: 64, nullable: true })
  phone_number: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'int', default: 0 })
  daily_upload_count: number;

  @Column({ length: 64, nullable: true })
  profile_pic_link: string;

  @Column({ type: 'boolean', default: false })
  completed_new_user_flow: boolean;

  // Relationships for the friend system
  @OneToMany(() => Follow, follow => follow.following)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.followed)
  followers: Follow[];
}