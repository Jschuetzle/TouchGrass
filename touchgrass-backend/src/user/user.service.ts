import { ILike, Not } from 'typeorm';
import { ConflictException, Injectable, BadRequestException } from '@nestjs/common';
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


  /**
   * Creates and persists a new User entity from the provided CreateUserDto.
   *
   * Expected Behavior:
   * - If the user ID already exists, throws BadRequestException.
   * - If the username already exists, throws ConflictException.
   * - Otherwise, inserts the new user into the database and returns it.
   * 
   * In the case where the user ID exists AND the username exists, the BadRequestException
   * will be favored, as this is a serious issue (possible impersonation).
   *
   * @param dto Data transfer object containing the fields required to create a user.
   * @returns The newly created User entity.
   * @throws BadRequestException if a user with the same ID already exists.
   * @throws ConflictException if a user with the same username already exists.
  **/
  async create(dto: CreateUserDto): Promise<User | null> {
    // EVENTUALLY MOVE TYPEORM CALLS TO IT'S OWN SERVICE CLASS
    // Otherwise, we tightly couple the mocks with the TypeORM calls...i.e. changing findBy to findOneBy would fail all tests 
    const duplicateUsers = await this.userRepo.findBy([
      { id: dto.id },
      { username: dto.username },
    ]);

    const userIdExisting = duplicateUsers.some(dupUser => dupUser.id === dto.id);
    const usernameExisting = duplicateUsers.some(dupUser => dupUser.username === dto.username);
  
    if (userIdExisting) {
      throw new BadRequestException();
    } else if (usernameExisting) {
      throw new ConflictException('Username already taken');
    }
  
    const user = this.userRepo.create(dto);
    return this.userRepo.save(user);
  }

  /**
   * Return the User entity associated with 'userId', if it exists.
   *
   * @param userId Unique Firebase user ID used for search
   * @returns The User entity associated with 'userId', otherwise null.
  **/
  async findUser(userId: string): Promise<User | null> {
    return await this.userRepo.findOneBy({ id: userId });
  }


  // look into testing/modifying this function after
  //  1. Talking w/ Abhi
  //  2. Getting hands dirty with friends feature
  async searchUsers(username: string, page = 1, limit = 10): Promise<User[]> {
    if (!username || !username.trim()) {
      return [];
    }

    const exactMatch = await this.userRepo.findOneBy({ username: username });
    const extraLimit = exactMatch ? limit - 1 : limit;

    const offset = (page - 1) * limit;
    const partialMatches = await this.userRepo.find({
      where: {
        username: ILike(`%${username}%`),
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