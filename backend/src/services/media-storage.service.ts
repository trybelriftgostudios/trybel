import crypto from 'crypto';
import { db } from '../db/db.js';

export class MediaStorageService {
  private static SECRET_SIGNING_KEY = process.env.MEDIA_SECRET || 'trybel-secure-s3-mock-signing-key-2026';
  private static URL_EXPIRY_SECONDS = 900; // 15 minutes

  /**
   * Generates a signed, expiring URL for an s3_key.
   * Format: https://cdn.trybel.internal/{s3Key}?exp={timestamp}&sig={signature}
   */
  public static generateSignedUrl(s3Key: string): string {
    const expiresAt = Math.floor(Date.now() / 1000) + this.URL_EXPIRY_SECONDS;
    const payload = `${s3Key}:${expiresAt}`;
    const signature = crypto
      .createHmac('sha256', this.SECRET_SIGNING_KEY)
      .update(payload)
      .digest('hex');
    
    // In dev / mock, we can return the media path with the signed exp/sig parameters
    return `https://media.trybel.internal/${s3Key}?exp=${expiresAt}&sig=${signature}`;
  }

  /**
   * Asserts whether a requesting user has authorized access to a photo.
   * Access is allowed IF:
   * 1. Requesting user is the photo uploader, OR
   * 2. Requesting user is in photo_audiences for this photo where revoked_at IS NULL.
   */
  public static canAccessPhoto(photoId: string, requestingUserId: string): boolean {
    const photo = db.photos.find(p => p.id === photoId);
    if (!photo) return false;
    if (photo.moderation_status === 'hold_for_review' || photo.moderation_status === 'removed') {
      return photo.user_id === requestingUserId; // only uploader can see their quarantined/removed photo
    }

    if (photo.user_id === requestingUserId) return true;

    // Check photo_audiences
    const audienceEntry = db.photoAudiences.find(
      pa => pa.photo_id === photoId && pa.friend_id === requestingUserId && !pa.revoked_at
    );
    return !!audienceEntry;
  }
}
