import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IImageStorageService } from 'src/image-storage/image-storage';
import { Services } from 'src/utils/constants';
import { generateUUIDV4 } from 'src/utils/helpers';
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
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorageService: IImageStorageService,
  ) {}

  createProfile(): Promise<Profile> {
    const newProfile = this.profileRepository.create();
    return this.profileRepository.save(newProfile);
  }

  async updateProfile(
    user: User,
    params: UpdateUserProfileParams,
  ): Promise<User> {
    const { about, banner, avatar } = params;
    if (about) {
      user.profile.about = about;
    }
    if (banner) {
      user.profile?.banner &&
        this.imageStorageService.deleteImage(user.profile.banner);
      user.profile.banner = await this.updateBanner(banner);
    }
    if (avatar) {
      user.profile?.avatar &&
        this.imageStorageService.deleteImage(user.profile.banner);
      user.profile.avatar = await this.updateAvatar(avatar);
    }
    return this.userRepository.save(user);
  }

  updateBanner(file: Express.Multer.File) {
    const key = generateUUIDV4();
    return this.imageStorageService.saveCompressedImage(key, file);
  }

  updateAvatar(file: Express.Multer.File) {
    const key = generateUUIDV4();
    return this.imageStorageService.saveCompressedImage(key, file);
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
