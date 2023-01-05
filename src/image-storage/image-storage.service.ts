import { Injectable } from '@nestjs/common';
import { exists, existsSync, unlink, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import * as crypto from 'crypto';
import { IImageStorageService } from './image-storage';
import { compressImage } from 'src/utils/helpers';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  async saveImage(
    imageName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // const fileUniqueSuffix = Date.now() + crypto.randomUUID();
    const fileExt = extname(file.originalname);
    const fileName = imageName + fileExt;
    const filePath = join('public', fileName);

    writeFileSync(filePath, file.buffer);

    return fileName;
  }

  async saveCompressedImage(
    imageName: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExt = extname(file.originalname);
    const fileName = imageName + fileExt;
    const filePath = join('public', fileName);

    writeFileSync(filePath, await compressImage(file));

    return fileName;
  }

  deleteImage(imageName: string): string {
    const filePath = join('public', imageName);
    if (existsSync(filePath)) unlinkSync(filePath);
    return filePath;
  }
}
