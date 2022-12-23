import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { IUsersService } from 'src/users/user';
import { Routes, Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { AuthenticatedGuard, LocalAuthGuard } from './utils/Guards';
import { Response } from 'express';
import { User } from 'src/utils/typeorm';
import { AuthUser } from 'src/utils/decorators';
import { Throttle } from '@nestjs/throttler';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUsersService,
  ) {}

  @Throttle(3, 10)
  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto) {
    const user = this.userService.createUser(createUserDto);

    return instanceToPlain(user);
  }

  @Post('login')
  @UseGuards(LocalAuthGuard)
  login(@Res() res: Response) {
    res.status(HttpStatus.OK).send('ok');
  }

  @Post('logout')
  logout() {}

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  async status(@AuthUser() user: User) {
    return user;
  }
}
