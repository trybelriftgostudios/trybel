import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Jimp } from 'jimp';

// Initialize Cloudinary v2 configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'trybel-campus',
  api_key: process.env.CLOUDINARY_API_KEY || 'trybel_dev_key',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'trybel_dev_secret',
  secure: true
});

export interface ImageProcessingOptions {
  width?: number;
  height?: number;
  quality?: number; // 1 - 100
  cropMode?: 'cover' | 'contain' | 'scale';
  greyscale?: boolean;
  watermarkText?: string;
}

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
  publicId?: string;
  resourceType?: 'image' | 'video' | 'auto';
  transformation?: any[];
}

export class CloudinaryMediaService {
  /**
   * On-the-fly server-side image processing using Jimp before upload or delivery.
   * Resizes, compresses, and manipulates images (e.g. product photography, lookbook reels).
   */
  public static async processImage(
    input: Buffer | string,
    options: ImageProcessingOptions = {}
  ): Promise<Buffer> {
    try {
      // Read image via Jimp
      const image = await Jimp.read(input as any);

      // 1. Resizing & Cropping
      if (options.width || options.height) {
        const targetWidth = options.width || image.bitmap.width;
        const targetHeight = options.height || image.bitmap.height;

        if (options.cropMode === 'cover') {
          image.cover({ w: targetWidth, h: targetHeight });
        } else {
          image.resize({ w: targetWidth, h: targetHeight });
        }
      }

      // 2. Greyscale filter if requested
      if (options.greyscale) {
        image.greyscale();
      }

      // Export processed image buffer (JPEG or PNG based on alpha channel)
      const mime = image.hasAlpha() ? 'image/png' : 'image/jpeg';
      const buffer = await image.getBuffer(mime as any);
      return buffer;
    } catch (err: any) {
      console.warn(`[Jimp] Processing warning (falling back to raw buffer): ${err.message}`);
      if (Buffer.isBuffer(input)) return input;
      return Buffer.from(input);
    }
  }

  /**
   * Uploads an asset (product photography, lookbook reel, campus photo) to Cloudinary.
   */
  public static async uploadMedia(
    fileBufferOrPath: Buffer | string,
    options: CloudinaryUploadOptions = {}
  ): Promise<{
    public_id: string;
    url: string;
    secure_url: string;
    width: number;
    height: number;
    format: string;
    optimized_url: string;
  }> {
    const folder = options.folder || 'trybel/campus_assets';
    const resourceType = options.resourceType || 'image';

    // If Cloudinary credentials are mock/default, produce a deterministic simulated Cloudinary asset
    const isMock = !process.env.CLOUDINARY_API_KEY || process.env.CLOUDINARY_API_KEY === 'trybel_dev_key';

    if (isMock) {
      const pseudoId = options.publicId || `asset_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const baseCdn = `https://res.cloudinary.com/trybel-campus/${resourceType}/upload`;
      const optimized = `${baseCdn}/f_auto,q_auto,w_800/${folder}/${pseudoId}`;
      const direct = `${baseCdn}/${folder}/${pseudoId}.jpg`;

      return {
        public_id: `${folder}/${pseudoId}`,
        url: direct,
        secure_url: direct,
        width: 800,
        height: 600,
        format: 'jpg',
        optimized_url: optimized
      };
    }

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          tags: options.tags || ['trybel', 'campus'],
          public_id: options.publicId,
          resource_type: resourceType,
          transformation: options.transformation || [{ quality: 'auto', fetch_format: 'auto' }]
        },
        (error, result) => {
          if (error || !result) {
            return reject(error || new Error('Upload failed'));
          }

          const optimizedUrl = cloudinary.url(result.public_id, {
            fetch_format: 'auto',
            quality: 'auto',
            secure: true
          });

          resolve({
            public_id: result.public_id,
            url: result.url,
            secure_url: result.secure_url,
            width: result.width,
            height: result.height,
            format: result.format,
            optimized_url: optimizedUrl
          });
        }
      );

      if (Buffer.isBuffer(fileBufferOrPath)) {
        uploadStream.end(fileBufferOrPath);
      } else {
        // If it's a URL or base64 data URI
        cloudinary.uploader.upload(
          fileBufferOrPath,
          {
            folder,
            resource_type: resourceType,
            tags: options.tags
          },
          (err, res) => {
            if (err || !res) return reject(err);
            resolve({
              public_id: res.public_id,
              url: res.url,
              secure_url: res.secure_url,
              width: res.width,
              height: res.height,
              format: res.format,
              optimized_url: cloudinary.url(res.public_id, { fetch_format: 'auto', quality: 'auto', secure: true })
            });
          }
        );
      }
    });
  }

  /**
   * Generates responsive, transformed Cloudinary URLs on-the-fly
   * for product cards, lookbook reels, hero banners, and user avatars.
   */
  public static getOptimizedUrl(
    publicId: string,
    transformations: {
      width?: number;
      height?: number;
      crop?: string;
      gravity?: string;
      format?: string;
      quality?: string | number;
    } = {}
  ): string {
    return cloudinary.url(publicId, {
      width: transformations.width || 800,
      height: transformations.height,
      crop: transformations.crop || 'fill',
      gravity: transformations.gravity || 'auto',
      fetch_format: transformations.format || 'auto',
      quality: transformations.quality || 'auto',
      secure: true
    });
  }
}
