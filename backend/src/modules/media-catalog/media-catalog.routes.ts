import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { CloudinaryMediaService } from '../../services/cloudinary-media.service.js';
import { SnapshotCacheService } from '../../db/snapshot-cache.js';
import { PostgresService } from '../../db/postgres-pool.js';

export async function mediaCatalogRoutes(fastify: FastifyInstance) {
  /**
   * 1. Campus Catalog Products
   * Returns product photography and lookbook catalog.
   * If PostgreSQL is cold or migrating, gracefully serves local-products-fallback.json.
   */
  fastify.get('/catalog/products', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (PostgresService.isDatabaseConnected()) {
        const result = await PostgresService.query('SELECT * FROM catalog_products ORDER BY created_at DESC');
        if (result.rows && result.rows.length > 0) {
          return reply.send({
            source: 'postgresql',
            count: result.rows.length,
            products: result.rows
          });
        }
      }
    } catch (err: any) {
      console.warn(`[Catalog] PostgreSQL query failover to snapshot cache: ${err.message}`);
    }

    // Zero-downtime resilient fallback snapshot
    const fallback = SnapshotCacheService.getProductsFallback();
    return reply.send({
      source: 'local_snapshot_cache',
      file: 'local-products-fallback.json',
      ...fallback
    });
  });

  /**
   * 2. Homepage Feed & Lookbook Reels
   * If PostgreSQL is cold, serves local-homepage-fallback.json for instant rendering.
   */
  fastify.get('/feed/homepage', async (_request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (PostgresService.isDatabaseConnected()) {
        const metadata = await PostgresService.query("SELECT value FROM catalog_metadata WHERE key = 'homepage_feed'");
        if (metadata.rows && metadata.rows[0]) {
          return reply.send({
            source: 'postgresql',
            ...metadata.rows[0].value
          });
        }
      }
    } catch (err: any) {
      console.warn(`[Homepage] Failover to local snapshot cache: ${err.message}`);
    }

    const fallback = SnapshotCacheService.getHomepageFallback();
    return reply.send({
      source: 'local_snapshot_cache',
      file: 'local-homepage-fallback.json',
      ...fallback
    });
  });

  /**
   * 3. Cloudinary + Jimp Media Processing & Upload
   * Manipulates images on-the-fly with Jimp and uploads to Cloudinary v2.
   */
  fastify.post('/media/process-upload', async (request: FastifyRequest<{
    Body: {
      image: string; // base64 or URL
      folder?: string;
      cropWidth?: number;
      cropHeight?: number;
      greyscale?: boolean;
      tags?: string[];
    }
  }>, reply: FastifyReply) => {
    const { image, folder, cropWidth, cropHeight, greyscale, tags } = request.body || {};

    if (!image) {
      return reply.status(400).send({ error: 'ImageRequired', message: 'Image base64 or URL is required' });
    }

    try {
      let inputBufferOrUrl: Buffer | string = image;
      if (image.startsWith('data:image')) {
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        inputBufferOrUrl = Buffer.from(base64Data, 'base64');
      }

      // Process on-the-fly with Jimp
      let processed: Buffer | string = inputBufferOrUrl;
      if (Buffer.isBuffer(inputBufferOrUrl) || cropWidth || cropHeight || greyscale) {
        processed = await CloudinaryMediaService.processImage(inputBufferOrUrl, {
          width: cropWidth,
          height: cropHeight,
          cropMode: 'cover',
          greyscale: !!greyscale
        });
      }

      // Upload to Cloudinary
      const uploadResult = await CloudinaryMediaService.uploadMedia(processed, {
        folder: folder || 'trybel/lookbooks',
        tags: tags || ['lookbook', 'campus_photography']
      });

      return reply.send({
        success: true,
        message: 'Media processed with Jimp and stored in Cloudinary',
        asset: uploadResult
      });
    } catch (err: any) {
      return reply.status(500).send({ error: 'ProcessingFailed', message: err.message });
    }
  });

  /**
   * 4. On-The-Fly Cloudinary URL Optimizer
   */
  fastify.get('/media/optimize', async (request: FastifyRequest<{
    Querystring: { publicId: string; width?: string; height?: string; quality?: string }
  }>, reply: FastifyReply) => {
    const { publicId, width, height, quality } = request.query || {};
    if (!publicId) {
      return reply.status(400).send({ error: 'MissingPublicId', message: 'publicId query parameter is required' });
    }

    const optimizedUrl = CloudinaryMediaService.getOptimizedUrl(publicId, {
      width: width ? parseInt(width) : 800,
      height: height ? parseInt(height) : undefined,
      quality: quality || 'auto'
    });

    return reply.send({
      public_id: publicId,
      optimized_url: optimizedUrl
    });
  });
}
