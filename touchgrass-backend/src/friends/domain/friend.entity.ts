import {
    Entity,
    Column,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../../user/domain/user.entity';
import { FOLLOWEDID_FOLLOWS_CONSTRAINT_NAME, FOLLOWINGID_FOLLOWS_CONSTRAINT_NAME, FOLLOWS_PK_CONSTRAINT_NAME } from '../../common/constants/db-constraints';
  
  @Entity('follows')
  export class Follow {
    @PrimaryColumn({ 
      type: 'varchar', 
      length: 128,
      primaryKeyConstraintName: FOLLOWS_PK_CONSTRAINT_NAME, 
    })
    following_id: string;
    
    @PrimaryColumn({ 
      type: 'varchar', 
      length: 128,
      primaryKeyConstraintName: FOLLOWS_PK_CONSTRAINT_NAME, 
    })
    followed_id: string;
    
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    requested_at: Date;

    @Column({ type: 'boolean', default: true })
    is_pending: boolean;
  
    // null is required for creating follows objects with no null accepted_at value
    @Column({ type: 'timestamp', nullable: true })
    accepted_at: Date | null;

    @ManyToOne(() => User, user => user.following, { onDelete: 'CASCADE' })
    @JoinColumn({ 
      name: 'following_id',
      foreignKeyConstraintName: FOLLOWINGID_FOLLOWS_CONSTRAINT_NAME,
    })
    following: User;
    
    @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
    @JoinColumn({ 
      name: 'followed_id',
      foreignKeyConstraintName: FOLLOWEDID_FOLLOWS_CONSTRAINT_NAME,
    })
    followed: User;
  }
