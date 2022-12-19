import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestException extends HttpException {
  constructor() {
    super('Cannot Accept Friend Request', HttpStatus.BAD_REQUEST);
  }
}
