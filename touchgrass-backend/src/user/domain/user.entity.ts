import {
  Entity,
  Column,
  PrimaryColumn,
  OneToMany,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Follow } from '../../friends/friend.entity';
import { USER_ENTITY_CONSTANTS } from '../../common/constants/entity';
import { Exclude, Transform } from 'class-transformer';
import { USER_PK_CONSTRAINT_NAME, USERNAME_CONSTRAINT_NAME } from '../../common/constants/db-constraints';

@Entity('user')
export class User {
  @PrimaryColumn({ 
    type: 'varchar', 
    length: USER_ENTITY_CONSTANTS.ID_MAX_LENGTH,
    primaryKeyConstraintName: USER_PK_CONSTRAINT_NAME,
  })
  @Exclude()
  id: string;

  @Unique(USERNAME_CONSTRAINT_NAME, ['username'])
  @Column({ length: USER_ENTITY_CONSTANTS.USERNAME_MAX_LENGTH })
  username: string;

  @Column({ length: USER_ENTITY_CONSTANTS.FIRSTNAME_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined)
  firstname: string;

  @Column({ length: USER_ENTITY_CONSTANTS.LASTNAME_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined)
  lastname: string;

  @Column({ length: USER_ENTITY_CONSTANTS.EMAIL_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined)
  email: string;

  @Column({ length: USER_ENTITY_CONSTANTS.PHONE_NUMBER_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined)
  phone_number: string;

  @CreateDateColumn()
  created_at: Date;

  @Column({ type: 'int', default: 0 })
  daily_upload_count: number;

  @Column({ length: USER_ENTITY_CONSTANTS.PROFILE_PIC_LINK_MAX_LENGTH, nullable: true })
  @Transform(({ value }) => value ?? undefined)
  profile_pic_link: string;

  @Column({ type: 'boolean', default: false })
  completed_new_user_flow: boolean;

  // Relationships for the friend system
  @OneToMany(() => Follow, follow => follow.following)
  following: Follow[];

  @OneToMany(() => Follow, follow => follow.followed)
  followers: Follow[];
}