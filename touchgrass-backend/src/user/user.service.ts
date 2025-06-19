import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private repo: Repository<User>,
  ) {}

  create(username: string, profile_pic: string) {
    const user = this.repo.create({ username, profile_pic });
    return this.repo.save(user);
  }

  findAll() {
    return this.repo.find();
  }
}