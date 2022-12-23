import { HttpException, HttpStatus } from '@nestjs/common';

export class NotFriendRequestReceiverException extends HttpException {
  constructor() {
    super('Not friend request receiver', HttpStatus.FORBIDDEN);
  }
}
