export interface IImageStorageService {
  saveImage(imageName: string, file: Express.Multer.File): Promise<string>;
  saveCompressedImage(
    imageName: string,
    file: Express.Multer.File,
  ): Promise<string>;
  deleteImage(imageName: string): string;
}
