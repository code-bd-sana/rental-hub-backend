import multer from 'multer';

// We use memory storage to keep the files in RAM temporarily.
// This allows our abstract FileUploadService to handle the actual storage logic (Local disk vs GCP).
const storage = multer.memoryStorage();

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept images and pdfs
  if (
    file.mimetype.startsWith('image/') ||
    file.mimetype === 'application/pdf'
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'));
  }
};

export const fileUploadMiddleware = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10 MB limit per file
  },
  fileFilter
});
