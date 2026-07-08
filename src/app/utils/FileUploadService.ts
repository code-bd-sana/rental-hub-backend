import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * FileUploadService
 * Abstracted file upload service.
 * Currently uses local filesystem storage. Can be easily swapped to GCP later.
 */
class FileUploadService {
  private readonly rootUploadPath = path.join(process.cwd(), 'uploads');

  constructor() {
    // Ensure root upload directory exists
    if (!fs.existsSync(this.rootUploadPath)) {
      fs.mkdirSync(this.rootUploadPath, { recursive: true });
    }
  }

  /**
   * Uploads a file to a specific folder.
   * @param file Express Multer File (memory storage)
   * @param folder Target folder inside 'uploads' (e.g., 'hosts/documents')
   * @returns The relative path to the saved file (e.g., '/uploads/hosts/documents/uuid.png')
   */
  public async uploadFile(
    file: Express.Multer.File,
    folder: string
  ): Promise<string> {
    const targetDir = path.join(this.rootUploadPath, folder);

    // Ensure the target subfolder exists
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Generate unique filename to prevent collisions
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const filePath = path.join(targetDir, uniqueFilename);

    // Save file buffer to local disk
    await fs.promises.writeFile(filePath, file.buffer);

    // Return the relative URL string that will be saved in the database
    // Later, when switching to GCP, this will return the public GCP URL.
    return `/uploads/${folder}/${uniqueFilename}`;
  }

  /**
   * Deletes a file from the storage.
   * @param relativeUrl The relative path stored in the database
   */
  public async deleteFile(relativeUrl: string): Promise<void> {
    // Check if it's a local file (for GCP, you'd extract the file path/ID differently)
    if (relativeUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), relativeUrl);
      if (fs.existsSync(filePath)) {
        await fs.promises.unlink(filePath);
      }
    }
  }
}

export const fileUploadService = new FileUploadService();
