import { v2 as cloudinary } from 'cloudinary';

import config from '../config';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret
});

export const uploadToCloudinary = async (
  fileBuffer: Buffer,
  folder: string
): Promise<string> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: 'image' }, (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed.'));
        } else {
          resolve(result.secure_url);
        }
      })
      .end(fileBuffer);
  });
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};

export default cloudinary;
