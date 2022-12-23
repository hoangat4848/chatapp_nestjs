import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestRejectedException extends HttpException {
  constructor() {
    super('Friend Request Rejected', HttpStatus.BAD_REQUEST);
  }
}
