import { Profile, User } from 'src/utils/typeorm';
import { UpdateUserProfileParams } from 'src/utils/types';

export interface IUserProfilesService {
  createProfile(): Promise<Profile>;
  updateProfile(user: User, params: UpdateUserProfileParams): Promise<User>;
  createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User>;
}
