import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { IUsersService } from 'src/users/interfaces/user';
import { Services } from 'src/utils/constants';
import { compareHash } from 'src/utils/helpers';
import { ValidateUsertDetails } from 'src/utils/types';
import { IAuthService } from './auth';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(Services.USERS) private readonly userService: IUsersService,
  ) {}

  async validateUser(userCredentials: ValidateUsertDetails) {
    const { username, password } = userCredentials;

    const user = await this.userService.findUser(
      { username },
      { selectAll: true },
    );
    if (!user)
      throw new HttpException('Invalid Credentials', HttpStatus.UNAUTHORIZED);

    const isPasswordCorrect = await compareHash(password, user.password);
    return isPasswordCorrect ? user : null;
  }
}
