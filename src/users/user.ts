import { User } from 'src/utils/typeorm';
import { CreateUserDetails, FindUserParams } from 'src/utils/types';

export interface IUsersService {
  createUser(userDetails: CreateUserDetails): Promise<User>;
  findUser(findUserParams: FindUserParams): Promise<User>;
  saveUser(user: User): Promise<User>;
  searchUsers(query: string): Promise<User[]>;
}
