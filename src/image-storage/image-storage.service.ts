import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { existsSync, unlinkSync, writeFileSync } from 'fs';
import { extname, join } from 'path';
import { IImageStorageService } from './image-storage';
import { compressImage } from 'src/utils/helpers';
import { v2 } from 'cloudinary';
const toStream = require('buffer-to-stream');

@Injectable()
export class ImageStorageService implements IImageStorageService {
  async uploadImageCloudinary(
    file: Express.Multer.File,
    key?: string,
  ): Promise<string> {
    const compressedImage = await compressImage(file);
    console.log(key);

    return new Promise((resolve, reject) => {
      const upload = v2.uploader.upload_stream(
        { folder: 'chatapp', filename_override: key },
        (error, result) => {
          if (error)
            throw new HttpException(
              'Error when uploading images. Try again',
              HttpStatus.BAD_REQUEST,
            );
          resolve(result.url);
        },
      );
      toStream(compressedImage).pipe(upload);
    });
  }

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
