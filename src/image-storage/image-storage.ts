export interface IImageStorageService {
  saveImage(imageName: string, file: Express.Multer.File): string;
  deleteImage(imageName: string): string;
}
