import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Follow } from '../friends/friend.entity';
import { USER_CONSTANTS } from '../common/constants';

@Entity('user')
export class User {
  @PrimaryColumn({ type: 'varchar', length: USER_CONSTANTS.ID_MAX_LENGTH })
  id: string;

  @Column({ length: USER_CONSTANTS.USERNAME_MAX_LENGTH, unique: true })
  username: string;

  @Column({ length: USER_CONSTANTS.FIRSTNAME_MAX_LENGTH, nullable: true })
  firstname: string;

  @Column({ length: USER_CONSTANTS.LASTNAME_MAX_LENGTH, nullable: true })
  lastname: string;

  @Column({ length: USER_CONSTANTS.EMAIL_MAX_LENGTH, nullable: true })
  email: string;

  @Column({ length: USER_CONSTANTS.PHONE_NUMBER_MAX_LENGTH, nullable: true })
  phone_number: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'int', default: 0 })
  daily_upload_count: number;

  @Column({ length: USER_CONSTANTS.PROFILE_PIC_LINK_MAX_LENGTH, nullable: true })
  profile_pic_link: string;

  @Column({ type: 'boolean', default: false })
  completed_new_user_flow: boolean;

  // Relationships for the friend system
  @OneToMany(() => Follow, follow => follow.following)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.followed)
  followers: Follow[];
}