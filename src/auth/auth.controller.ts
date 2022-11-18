import { Body, Controller, Get, Inject, Post } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { IUserService } from 'src/users/user';
import { Routes, Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/CreateUser.dto';

@Controller(Routes.AUTH)
export class AuthController {
  constructor(
    @Inject(Services.AUTH) private authService: IAuthService,
    @Inject(Services.USERS) private userService: IUserService,
  ) {}

  @Post('register')
  registerUser(@Body() createUserDto: CreateUserDto) {
    const user = this.userService.createUser(createUserDto);

    return instanceToPlain(user);
  }

  @Post('login')
  login() {}
  @Post('logout')
  logout() {}
  @Get('status')
  status() {}
}
