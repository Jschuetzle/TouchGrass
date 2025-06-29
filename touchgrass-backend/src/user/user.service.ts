import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async create(dto: CreateUserDto) {
    const user = this.userRepo.create(dto); // Automatically maps fields
    return this.userRepo.save(user);
  }

  async findAll() {
    return this.userRepo.find();
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return !!user;
  }
}