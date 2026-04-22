const { v2: cloudinary } = require('cloudinary');

const { env } = require('../../config/env');
const { AppError } = require('../../core/errors/app-error');

function ensureCloudinaryConfigured() {
  if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new AppError('Cloudinary is not configured yet', 503, {
      requiredEnv: ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'],
    });
  }

  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

function sanitizeFolderSegment(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-/]+/g, '-')
    .replace(/\/+/g, '/')
    .replace(/(^[/-]+|[/-]+$)/g, '')
    .replace(/-{2,}/g, '-');
}

async function uploadImage(file, folder = 'content') {
  ensureCloudinaryConfigured();

  if (!file) {
    throw new AppError('Image file is required', 400);
  }

  const baseFolder = sanitizeFolderSegment(env.CLOUDINARY_FOLDER || 'ppdc-backend');
  const targetFolder = sanitizeFolderSegment(folder || 'content');
  const resolvedFolder = [baseFolder, targetFolder].filter(Boolean).join('/');

  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: resolvedFolder,
        resource_type: 'image',
        overwrite: false,
      },
      (error, response) => {
        if (error) {
          if (error.http_code === 403) {
            reject(new AppError(
              'Cloudinary rejected the upload. Check API key permissions or use a full-access key.',
              502,
              error,
            ));
            return;
          }

          reject(new AppError('Image upload failed', 502, error));
          return;
        }

        resolve(response);
      },
    );

    stream.end(file.buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
    originalName: file.originalname,
  };
}

module.exports = { uploadImage };
