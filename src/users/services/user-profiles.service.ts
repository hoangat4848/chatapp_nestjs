import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile, User } from 'src/utils/typeorm';
import { UpdateUserProfileParams } from 'src/utils/types';
import { Repository } from 'typeorm';
import { IUserProfilesService } from '../interfaces/user-profile';

@Injectable()
export class UserProfilesService implements IUserProfilesService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  createProfile(): Promise<Profile> {
    const newProfile = this.profileRepository.create();
    return this.profileRepository.save(newProfile);
  }

  async updateProfile(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User> {
    const { about } = params;
    if (about) {
      user.profile.about = about;
    }
    return this.userRepository.save(user);
  }

  async createProfileOrUpdate(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User> {
    const { about } = params;
    if (!user.profile) {
      user.profile = await this.createProfile();
    }
    return this.updateProfile(user, params);
  }
}
