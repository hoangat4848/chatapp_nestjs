import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFriendRequestSenderException extends HttpException {
  constructor() {
    super('Not friend request sender', HttpStatus.FORBIDDEN);
  }
}
