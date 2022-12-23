import { HttpException, HttpStatus } from '@nestjs/common';

export class FriendRequestException extends HttpException {
  constructor(message?: string) {
    const defaultMessage = 'Friend Request Exception';
    const error = message
      ? defaultMessage.concat(': ', message)
      : defaultMessage;
    super(error, HttpStatus.BAD_REQUEST);
  }
}
