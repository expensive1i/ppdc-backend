const { AppError } = require('../../core/errors/app-error');
const uploadsService = require('./uploads.service');

async function uploadImage(req, res) {
  if (!req.file) {
    throw new AppError('Image file is required', 400);
  }

  const result = await uploadsService.uploadImage(req.file, req.body.folder);

  return res.status(201).json(result);
}

module.exports = { uploadImage };
