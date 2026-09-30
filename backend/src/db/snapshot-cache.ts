import fs from 'fs';
import path from 'path';

export class SnapshotCacheService {
  private static DATA_DIR = path.join(process.cwd(), 'data');

  private static ensureDataDir(): void {
    if (!fs.existsSync(this.DATA_DIR)) {
      fs.mkdirSync(this.DATA_DIR, { recursive: true });
    }
  }

  /**
   * Loads a JSON snapshot fallback file from disk.
   */
  public static loadSnapshot<T>(fileName: string, fallbackData: T): T {
    this.ensureDataDir();
    const filePath = path.join(this.DATA_DIR, fileName);

    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw) as T;
      }
    } catch (err: any) {
      console.warn(`[Snapshot Cache] Unable to read ${fileName}, using in-memory fallback: ${err.message}`);
    }

    return fallbackData;
  }

  /**
   * Persists a JSON snapshot to disk for zero-downtime offline / build-time rendering.
   */
  public static saveSnapshot(fileName: string, data: any): void {
    this.ensureDataDir();
    const filePath = path.join(this.DATA_DIR, fileName);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err: any) {
      console.warn(`[Snapshot Cache] Error persisting ${fileName}: ${err.message}`);
    }
  }

  /**
   * Retrieves products fallback snapshot cache (local-products-fallback.json)
   */
  public static getProductsFallback(): any {
    return this.loadSnapshot('local-products-fallback.json', { products: [] });
  }

  /**
   * Retrieves homepage fallback snapshot cache (local-homepage-fallback.json)
   */
  public static getHomepageFallback(): any {
    return this.loadSnapshot('local-homepage-fallback.json', { trending_posts: [], lookbook_reels: [] });
  }
}
