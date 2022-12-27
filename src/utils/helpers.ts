import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import { AuthenticatedRequest } from './types';

export async function hashPassword(rawPassword: string) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(rawPassword, salt);
  return hashedPassword;
}

export async function compareHash(rawPassword: string, hashedPassword: string) {
  console.log('hello from compare hash password');

  return bcrypt.compare(rawPassword, hashedPassword);
}

export function isAuthorized(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  console.log('isAuthorized');
  if (req.user) next();
  else throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
}
