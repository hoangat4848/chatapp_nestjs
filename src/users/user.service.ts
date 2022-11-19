import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/utils/typeorm';
import { CreateUserDetails, FindUserParams } from 'src/utils/types';
import { IUserService } from './user';
import { hashPassword } from 'src/utils/helpers';

@Injectable()
export class UserService implements IUserService {
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

  async findUser(findUserParams: FindUserParams) {
    return this.userRepository.findOneBy(findUserParams);
  }
}
