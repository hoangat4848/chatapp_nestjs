import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { IUsersService } from 'src/users/interfaces/user';
import { Routes, Services } from 'src/utils/constants';
import { IAuthService } from './auth';
import { CreateUserDto } from './dtos/CreateUser.dto';
import { AuthenticatedGuard, LocalAuthGuard } from './utils/Guards';
import { Response } from 'express';
import { User } from 'src/utils/typeorm';
import { AuthUser } from 'src/utils/decorators';
import { Throttle } from '@nestjs/throttler';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthenticatedRequest } from 'src/utils/types';

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
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    req.logout((err) => {
      return err ? res.send(HttpStatus.BAD_REQUEST) : res.send(HttpStatus.OK);
    });
  }

  @Get('status')
  @UseGuards(AuthenticatedGuard)
  async status(@AuthUser() user: User) {
    return user;
  }
}
