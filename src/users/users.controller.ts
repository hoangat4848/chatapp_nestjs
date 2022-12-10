import { Controller, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Get, Query } from '@nestjs/common/decorators';
import { Routes, Services } from 'src/utils/constants';
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
}
