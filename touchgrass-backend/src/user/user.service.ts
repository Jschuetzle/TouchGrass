import { ILike, Not } from 'typeorm';
import { BadRequestException, Injectable } from '@nestjs/common';
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
    const [existingById, existingByUsername] = await Promise.all([
      this.userRepo.findOneBy({ id: dto.id }),
      this.userRepo.findOneBy({ username: dto.username }),
    ]);
  
    if (existingById) {
      throw new BadRequestException('User with this ID already exists');
    }
  
    if (existingByUsername) {
      throw new BadRequestException('Username is already taken');
    }
  
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }
  async findAll() {
    return this.userRepo.find();
  }

  async userExists(userId: string): Promise<boolean> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return !!user;
  }

  async searchUsers(query: string, page = 1, limit = 10): Promise<User[]> {
    const offset = (page - 1) * limit;

    const exactMatch = await this.userRepo.findOne({ where: { username: query } });

    const extraLimit = exactMatch ? limit - 1 : limit;

    const partialMatches = await this.userRepo.find({
      where: {
        username: ILike(`%${query}%`),
        ...(exactMatch && { id: Not(exactMatch.id) }),
      },
      skip: offset,
      take: extraLimit,
    });

    if (exactMatch) {
      return [exactMatch, ...partialMatches];
    }

    return partialMatches;
  }
}