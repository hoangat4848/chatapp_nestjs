import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUserService } from 'src/users/user';
import { Services } from 'src/utils/constants';
import { compareHash } from 'src/utils/helpers';
import { ValidateUsertDetails } from 'src/utils/types';
import { IAuthService } from './auth';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUserService,
  ) {}

  async validateUser(userCredentials: ValidateUsertDetails) {
    const { email, password } = userCredentials;

    const user = await this.userService.findUser({ email });
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

    const isPasswordCorrect = await compareHash(password, user.password);
    return isPasswordCorrect;
  }
}
