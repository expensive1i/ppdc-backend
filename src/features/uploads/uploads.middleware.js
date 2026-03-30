const multer = require('multer');

const { AppError } = require('../../core/errors/app-error');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new AppError('Only image uploads are allowed', 400));
      return;
    }

    callback(null, true);
  },
});

module.exports = { imageUpload, MAX_FILE_SIZE };
