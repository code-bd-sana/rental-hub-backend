import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

/**
 * Uploads a file buffer to AWS S3
 * @param fileBuffer - The file buffer to upload
 * @param mimetype - The mime type of the file (e.g., 'image/jpeg')
 * @param originalName - The original file name
 * @returns The public URL of the uploaded file
 */
export const uploadToS3 = async (
  fileBuffer: Buffer,
  mimetype: string,
  originalName: string
): Promise<string> => {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error('AWS_S3_BUCKET_NAME is not defined in environment variables');
  }

  // Generate a unique file name
  const extension = originalName.split('.').pop();
  const fileName = `listings/${uuidv4()}-${Date.now()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: mimetype,
  });

  try {
    await s3Client.send(command);
    
    // Construct the public URL (Assuming bucket is public or public read access is configured)
    const region = await s3Client.config.region();
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
    
    return publicUrl;
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    throw new Error('Failed to upload image to S3');
  }
};
