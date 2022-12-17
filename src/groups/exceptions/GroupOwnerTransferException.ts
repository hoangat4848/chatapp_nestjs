import { HttpException, HttpStatus } from '@nestjs/common';

export class GroupOwnerTransferException extends HttpException {
  constructor(message: string = 'Group Owner Transfer Error') {
    super(message, HttpStatus.BAD_REQUEST);
  }
}
