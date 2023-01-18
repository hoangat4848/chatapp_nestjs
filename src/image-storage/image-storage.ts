import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';

export interface IImageStorageService {
  uploadImageCloudinary(
    file: Express.Multer.File,
    key?: string,
  ): Promise<string>;
  saveImage(imageName: string, file: Express.Multer.File): Promise<string>;
  saveCompressedImage(
    imageName: string,
    file: Express.Multer.File,
  ): Promise<string>;
  deleteImage(imageName: string): string;
}
