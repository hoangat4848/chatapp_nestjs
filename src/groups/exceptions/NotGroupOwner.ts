import { HttpException, HttpStatus } from '@nestjs/common';

export class NotGroupOwnerException extends HttpException {
  constructor() {
    super('Not Group Owner', HttpStatus.FORBIDDEN);
  }
}
