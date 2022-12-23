import { Controller, HttpException, HttpStatus, Inject } from '@nestjs/common';
import {
  Body,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common/decorators';
import { FileInterceptor } from '@nestjs/platform-express';
import { Routes, Services } from 'src/utils/constants';
import { UserProfileDto } from './dtos/UserProfile.dto';
import { IUsersService } from './user';

@Controller(Routes.USERS)
export class UsersController {
  constructor(
    @Inject(Services.USERS) private readonly usersService: IUsersService,
  ) {}

  @Get('search')
  searchUsers(@Query('query') query: string) {
    if (!query)
      throw new HttpException('Provide a valid query', HttpStatus.BAD_REQUEST);

    return this.usersService.searchUsers(query);
  }

  @Post('profiles')
  @UseInterceptors(FileInterceptor('file'))
  async completeProfile(
    @UploadedFile() file: Express.Multer.File,
    @Body() userProfileDto: UserProfileDto,
  ) {
    console.log(file);
    console.log(userProfileDto.about, userProfileDto.username);
  }
}
