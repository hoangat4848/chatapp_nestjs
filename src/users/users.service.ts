import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/utils/typeorm';
import {
  CreateUserDetails,
  FindUserOptions,
  FindUserParams,
} from 'src/utils/types';
import { IUsersService } from './user';
import { hashPassword } from 'src/utils/helpers';

@Injectable()
export class UsersService implements IUsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createUser(userDetails: CreateUserDetails) {
    const existingUser = await this.userRepository.findOneBy({
      email: userDetails.email,
    });
    if (existingUser)
      throw new HttpException('User already exists', HttpStatus.CONFLICT);

    const password = await hashPassword(userDetails.password);
    const newUser = await this.userRepository.create({
      ...userDetails,
      password,
    });
    return this.userRepository.save(newUser);
  }

  async findUser(params: FindUserParams, options?: FindUserOptions) {
    const selections: (keyof User)[] = [
      'email',
      'firstName',
      'lastName',
      'id',
      'profile',
    ];
    const selectionsWithPassword: (keyof User)[] = [...selections, 'password'];

    return this.userRepository.findOne({
      where: params,
      select: options?.selectAll ? selectionsWithPassword : selections,
    });
  }

  async saveUser(user: User): Promise<User> {
    return this.userRepository.save(user);
  }

  async searchUsers(query: string): Promise<User[]> {
    const searchStatement = '(user.email LIKE :query)';
    return this.userRepository
      .createQueryBuilder('user')
      .where(searchStatement, { query: `%${query}%` })
      .limit(10)
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.profile',
      ])
      .getMany();
  }
}
