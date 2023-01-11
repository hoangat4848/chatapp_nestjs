import { HttpException, HttpStatus } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NextFunction, Response } from 'express';
import { Attachment, AuthenticatedRequest } from './types';
import { v4 as uuidv4 } from 'uuid';
import * as Sharp from 'sharp';

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
  if (req.user) next();
  else throw new HttpException('Forbidden', HttpStatus.UNAUTHORIZED);
}

export const generateUUIDV4 = () => uuidv4() as string;

export const compressImage = (attachment: Attachment) =>
  Sharp(attachment.buffer).resize(300).jpeg().toBuffer();
