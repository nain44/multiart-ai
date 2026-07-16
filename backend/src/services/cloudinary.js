const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { Readable } = require('stream');

// ── Configure Cloudinary ────────────────────────────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── Multer memory storage (buffer, no temp files) ───────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// ── Upload a buffer to Cloudinary v2 ────────────────────────────────────────
/**
 * Uploads req.file.buffer to Cloudinary and returns the upload result.
 * Must be called after multer has processed the request.
 *
 * @param {Buffer} buffer
 * @param {string} originalname  - used to derive the public_id
 * @returns {Promise<UploadApiResponse>}
 */
function uploadToCloudinary(buffer, originalname) {
  return new Promise((resolve, reject) => {
    const publicId = `MultiArt AI/wallpapers/${Date.now()}-${originalname.replace(/\.[^.]+$/, '')}`;

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'MultiArt AI/wallpapers',
        public_id: publicId,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Pipe the buffer into the upload stream
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
}

// ── Generate a thumbnail URL from an existing Cloudinary URL ────────────────
/**
 * Transforms a Cloudinary image URL to produce a thumbnail version.
 * Uses Cloudinary's URL-based transformation — zero extra storage.
 */
const generateThumbnail = (originalUrl, width = 400, height = 700) => {
  return originalUrl.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`
  );
};

// ── Delete a Cloudinary image by public_id ──────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  return cloudinary.uploader.destroy(publicId);
};

module.exports = { cloudinary, upload, uploadToCloudinary, generateThumbnail, deleteFromCloudinary };
