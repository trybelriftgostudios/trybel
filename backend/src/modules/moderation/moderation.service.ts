import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { AdminActivityLog } from '../../types/index.js';

export interface ModerationResult {
  status: 'clean' | 'hold_for_review' | 'flagged_auto';
  highestScore: number;
  category?: string;
  flaggedCategories: string[];
}

export class ModerationService {
  // Configured prohibited toxic patterns/keywords
  private static highRiskKeywords = ['hate', 'kill', 'attack', 'slur', 'harass', 'suicide', 'bomb', 'weapon', 'threat'];
  private static mediumRiskKeywords = ['idiot', 'scam', 'fake', 'annoying', 'cheat', 'crap'];

  /**
   * Evaluates text through the moderation screening pipeline.
   * - High Confidence (S >= 0.85) -> hold_for_review (quarantined)
   * - Medium Confidence (0.50 <= S < 0.85) -> flagged_auto (queued but published)
   * - Low Confidence (S < 0.50) -> clean
   */
  public static screenText(text: string): ModerationResult {
    const lower = text.toLowerCase();
    
    let highMatches = 0;
    let mediumMatches = 0;
    const flaggedCategories: string[] = [];

    for (const kw of this.highRiskKeywords) {
      if (lower.includes(kw)) {
        highMatches++;
        flaggedCategories.push('harassment_threat');
      }
    }

    for (const kw of this.mediumRiskKeywords) {
      if (lower.includes(kw)) {
        mediumMatches++;
        flaggedCategories.push('profanity_spam');
      }
    }

    if (highMatches > 0) {
      const score = Math.min(0.85 + highMatches * 0.05, 0.99);
      return {
        status: 'hold_for_review',
        highestScore: score,
        category: flaggedCategories[0],
        flaggedCategories
      };
    }

    if (mediumMatches > 0) {
      const score = Math.min(0.50 + mediumMatches * 0.1, 0.80);
      return {
        status: 'flagged_auto',
        highestScore: score,
        category: flaggedCategories[0],
        flaggedCategories
      };
    }

    return {
      status: 'clean',
      highestScore: 0.05,
      flaggedCategories: []
    };
  }

  /**
   * Writes an immutable audit record to admin_activity_logs.
   * Every moderator or admin action MUST call this.
   */
  public static logAdminAction(params: {
    actorId: string;
    actorCollegeId: string;
    action: string;
    targetObjectType: string;
    targetObjectId: string;
    reason?: string;
    metadata?: Record<string, any>;
    ipAddress?: string;
  }): AdminActivityLog {
    const log: AdminActivityLog = {
      id: uuidv4(),
      actor_id: params.actorId,
      actor_college_id: params.actorCollegeId,
      action: params.action,
      target_object_type: params.targetObjectType,
      target_object_id: params.targetObjectId,
      reason: params.reason || '',
      metadata: params.metadata || {},
      ip_address: params.ipAddress || '127.0.0.1',
      timestamp: new Date().toISOString()
    };

    db.adminActivityLogs.unshift(log);
    db.save();
    return log;
  }
}
