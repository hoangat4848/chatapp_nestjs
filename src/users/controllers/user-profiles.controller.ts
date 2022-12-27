import {
  Body,
  Controller,
  Inject,
  Patch,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedGuard } from 'src/auth/utils/Guards';
import { Routes, Services } from 'src/utils/constants';
import { AuthUser } from 'src/utils/decorators';
import { User } from 'src/utils/typeorm';
import { UpdateUserProfileParams } from 'src/utils/types';
import { UpdateUserProfileDto } from '../dtos/UpdateUserProfile.dto';
import { IUserProfilesService } from '../interfaces/user-profile';

@UseGuards(AuthenticatedGuard)
@Controller(Routes.USER_PROFILES)
export class UserProfilesController {
  constructor(
    @Inject(Services.USER_PROFILES)
    private readonly userProfilesService: IUserProfilesService,
  ) {}

  @Patch()
  @UseInterceptors(FileInterceptor('file'))
  async updateUserProfile(
    @AuthUser() user: User,
    @Body() updateUserProfileDto: UpdateUserProfileDto,
  ) {
    const params: UpdateUserProfileParams = {
      ...updateUserProfileDto,
    };
    const profile = await this.userProfilesService.createProfileOrUpdate(
      user,
      params,
    );
    return profile;
  }
}
