import {
    Entity,
    Column,
    PrimaryColumn,
    ManyToOne,
    JoinColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  
  @Entity('follows')
  export class Follow {
    @PrimaryColumn({ type: 'varchar', length: 128 })
    following_id: string;
    
    @PrimaryColumn({ type: 'varchar', length: 128 })
    followed_id: string;
  
    @Column({ default: true })
    is_pending: boolean;
  
    @Column({ type: 'timestamp', nullable: true })
    accepted_at: Date;
  
    @ManyToOne(() => User, user => user.following, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'following_id' })
    following: User;
    
    @ManyToOne(() => User, user => user.followers, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'followed_id' })
    followed: User;
  }
