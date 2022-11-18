import { Injectable } from '@nestjs/common';
import { CreateUserDetails } from 'src/utils/types';
import { IUserService } from './user';

@Injectable()
export class UserService implements IUserService {
  createUser(userDetails: CreateUserDetails) {
    console.log(userDetails);
  }
}
