import { v2 as cloudinary } from 'cloudinary';
import { Services } from 'src/utils/constants';

export const CloudinaryProvider = {
  provide: Services.CLOUDINARY,
  useFactory: () => {
    return cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  },
};
