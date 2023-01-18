import {
  Body,
  Controller,
  Inject,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { IImageStorageService } from 'src/image-storage/image-storage';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { UpdateUserProfileParams, UserProfileFiles } from 'src/utils/types';
import { UpdateUserProfileDto } from '../dtos/UpdateUserProfile.dto';
import { IUserProfilesService } from '../interfaces/user-profile';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.USER_PROFILES)
export class UserProfilesController {
  constructor(
    @Inject(Services.USER_PROFILES)
    private readonly userProfilesService: IUserProfilesService,
    @Inject(Services.IMAGE_STORAGE)
    private readonly imageStorage: IImageStorageService,
  ) {}

  @Post('test')
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'banner',
        maxCount: 1,
      },
      {
        name: 'avatar',
        maxCount: 1,
      },
    ]),
  )
  async test(
    @AuthUser() user: User,
    @UploadedFiles() files: UserProfileFiles,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const params: UpdateUserProfileParams = {
      ...updateUserProfileDto,
    };

    const result = await this.imageStorage.uploadImageCloudinary(
      files.banner[0],
    );
    console.log(files);

    return result ?? 'No result';
  }

  @Patch()
  @UseInterceptors(
    FileFieldsInterceptor([
      {
        name: 'banner',
        maxCount: 1,
      },
      {
        name: 'avatar',
        maxCount: 1,
      },
    ]),
  )
  async updateUserProfile(
    @AuthUser() user: User,
    @UploadedFiles() files: UserProfileFiles,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const params: UpdateUserProfileParams = {
      ...updateUserProfileDto,
    };
    console.log(files);

    files.banner && (params.banner = files.banner[0]);
    files.avatar && (params.avatar = files.avatar[0]);
    const profile = await this.userProfilesService.createProfileOrUpdate(
      user,
      params,
    );
    return profile;
  }
}
