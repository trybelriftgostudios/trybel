import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../../db/db.js';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { MediaStorageService } from '../../services/media-storage.service.js';

export async function friendPhotoRoutes(fastify: FastifyInstance) {
  fastify.addHook('preHandler', authenticateToken);

  // 1. Get friends & friend requests
  fastify.get('/friends', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.userId;
    const userCollegeId = request.user!.collegeId;

    // Accepted friends
    const friendships = db.friendships.filter(
      f => (f.requester_id === userId || f.addressee_id === userId) && f.status === 'accepted'
    );
    const friendUserIds = friendships.map(f => (f.requester_id === userId ? f.addressee_id : f.requester_id));
    const friends = friendUserIds.map(fid => {
      const prof = db.profiles.find(p => p.user_id === fid);
      return {
        id: fid,
        name: prof?.full_name || 'Friend',
        avatar_url: prof?.avatar_url,
        department: prof?.department,
        year_of_study: prof?.year_of_study
      };
    });

    // Pending requests received
    const pendingReceived = db.friendships.filter(f => f.addressee_id === userId && f.status === 'pending');
    const requests = pendingReceived.map(req => {
      const prof = db.profiles.find(p => p.user_id === req.requester_id);
      return {
        request_id: req.id,
        user_id: req.requester_id,
        name: prof?.full_name || 'Student',
        avatar_url: prof?.avatar_url,
        department: prof?.department,
        year_of_study: prof?.year_of_study
      };
    });

    // Suggested friends (same college, not yet friends)
    const suggestedUsers = db.users.filter(u =>
      u.college_id === userCollegeId &&
      u.id !== userId &&
      !friendUserIds.includes(u.id) &&
      !pendingReceived.some(r => r.requester_id === u.id)
    );
    const suggested = suggestedUsers.slice(0, 5).map(u => {
      const prof = db.profiles.find(p => p.user_id === u.id);
      return {
        id: u.id,
        name: prof?.full_name || 'Student',
        avatar_url: prof?.avatar_url,
        department: prof?.department,
        year_of_study: prof?.year_of_study
      };
    });

    return reply.send({ friends, requests, suggested });
  });

  // 2. Send friend request (same college)
  fastify.post('/friends/request', async (request: FastifyRequest<{ Body: { target_user_id: string } }>, reply: FastifyReply) => {
    const userId = request.user!.userId;
    const { target_user_id } = request.body || {};

    const targetUser = db.users.find(u => u.id === target_user_id);
    if (!targetUser) {
      return reply.status(404).send({ error: 'NotFound', message: 'User not found' });
    }

    if (targetUser.college_id !== request.user!.collegeId) {
      return reply.status(403).send({ error: 'Forbidden', message: 'Friend requests are restricted to students in your college network.' });
    }

    const existing = db.friendships.find(
      f => (f.requester_id === userId && f.addressee_id === target_user_id) ||
           (f.requester_id === target_user_id && f.addressee_id === userId)
    );
    if (existing) {
      return reply.status(400).send({ error: 'AlreadyExists', message: `Friendship state is already: ${existing.status}` });
    }

    const friendship = {
      id: 'fr_' + uuidv4().substring(0, 8),
      college_id: request.user!.collegeId,
      requester_id: userId,
      addressee_id: target_user_id,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.friendships.push(friendship);

    // Notify target
    const myProfile = db.profiles.find(p => p.user_id === userId);
    db.notifications.push({
      id: 'notif_' + uuidv4().substring(0, 8),
      user_id: target_user_id,
      college_id: request.user!.collegeId,
      category: 'friend',
      title: 'New Friend Request',
      body: `${myProfile?.full_name || 'A student'} sent you a friend request.`,
      deep_link_screen: 'Friends',
      read: false,
      created_at: 'Just now'
    });

    db.save();

    return reply.status(201).send({ success: true, message: 'Friend request sent', friendship });
  });

  // 3. Accept friend request & sync photo audiences
  fastify.post('/friends/requests/:id/accept', async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
    const friendship = db.friendships.find(f => f.id === request.params.id && f.addressee_id === request.user!.userId);
    if (!friendship) {
      return reply.status(404).send({ error: 'NotFound', message: 'Friend request not found' });
    }

    friendship.status = 'accepted';
    friendship.updated_at = new Date().toISOString();

    const friendA = friendship.requester_id;
    const friendB = friendship.addressee_id;

    // Grant reciprocal photo audience
    const photosA = db.photos.filter(p => p.user_id === friendA);
    for (const p of photosA) {
      db.photoAudiences.push({
        id: 'pa_' + uuidv4().substring(0, 8),
        photo_id: p.id,
        friend_id: friendB,
        granted_at: new Date().toISOString()
      });
    }

    const photosB = db.photos.filter(p => p.user_id === friendB);
    for (const p of photosB) {
      db.photoAudiences.push({
        id: 'pa_' + uuidv4().substring(0, 8),
        photo_id: p.id,
        friend_id: friendA,
        granted_at: new Date().toISOString()
      });
    }

    db.save();
    return reply.send({ success: true, message: 'Friend request accepted and photo audiences updated' });
  });

  // 4. Unfriend: IMMEDIATELY REVOKES photo audience access!
  fastify.post('/friends/:friendId/unfriend', async (request: FastifyRequest<{ Params: { friendId: string } }>, reply: FastifyReply) => {
    const userId = request.user!.userId;
    const friendId = request.params.friendId;

    const friendship = db.friendships.find(
      f => (f.requester_id === userId && f.addressee_id === friendId) ||
           (f.requester_id === friendId && f.addressee_id === userId)
    );

    if (!friendship) {
      return reply.status(404).send({ error: 'NotFound', message: 'Friendship record not found' });
    }

    friendship.status = 'declined';
    friendship.updated_at = new Date().toISOString();

    // IMMEDIATE REVOCATION of photo audiences
    const userPhotos = db.photos.filter(p => p.user_id === userId).map(p => p.id);
    const friendPhotos = db.photos.filter(p => p.user_id === friendId).map(p => p.id);

    for (const pa of db.photoAudiences) {
      if ((userPhotos.includes(pa.photo_id) && pa.friend_id === friendId) ||
          (friendPhotos.includes(pa.photo_id) && pa.friend_id === userId)) {
        pa.revoked_at = new Date().toISOString();
      }
    }

    db.save();

    return reply.send({
      success: true,
      message: 'Unfriended successfully. Photo access revoked immediately.'
    });
  });

  // 5. Get Photos: strictly verifies photo_audiences and generates signed expiring URLs
  fastify.get('/photos', async (request: FastifyRequest, reply: FastifyReply) => {
    const userId = request.user!.userId;

    // Photos uploaded by user OR where user is in active photo_audiences
    const accessiblePhotos = db.photos.filter(p => MediaStorageService.canAccessPhoto(p.id, userId));

    const photosWithSignedUrls = accessiblePhotos.map(p => {
      const uploader = db.profiles.find(prof => prof.user_id === p.user_id);
      return {
        id: p.id,
        user_id: p.user_id,
        uploader_name: uploader?.full_name || 'Student',
        caption: p.caption,
        created_at: p.created_at,
        // Generated signed expiring URL (15-min TTL)
        signed_url: MediaStorageService.generateSignedUrl(p.s3_key),
        is_mine: p.user_id === userId
      };
    });

    return reply.send({ total: photosWithSignedUrls.length, data: photosWithSignedUrls });
  });

  // 6. Upload photo
  fastify.post('/photos', async (request: FastifyRequest<{ Body: { caption?: string; s3_key?: string } }>, reply: FastifyReply) => {
    const userId = request.user!.userId;
    const userCollegeId = request.user!.collegeId;
    const { caption, s3_key } = request.body || {};

    const photoId = 'photo_' + uuidv4().substring(0, 8);
    const resolvedKey = s3_key || `colleges/${userCollegeId}/users/${userId}/photos/${photoId}.jpg`;

    const photo = {
      id: photoId,
      user_id: userId,
      college_id: userCollegeId,
      s3_key: resolvedKey,
      caption: caption || '',
      moderation_status: 'clean' as const,
      created_at: new Date().toISOString()
    };

    db.photos.unshift(photo);

    // Auto-populate photo_audiences with current accepted friends
    const currentFriendships = db.friendships.filter(
      f => (f.requester_id === userId || f.addressee_id === userId) && f.status === 'accepted'
    );
    const friendIds = currentFriendships.map(f => (f.requester_id === userId ? f.addressee_id : f.requester_id));

    for (const fid of friendIds) {
      db.photoAudiences.push({
        id: 'pa_' + uuidv4().substring(0, 8),
        photo_id: photoId,
        friend_id: fid,
        granted_at: new Date().toISOString()
      });
    }

    db.save();

    return reply.status(201).send({
      success: true,
      message: 'Photo uploaded and shared with accepted friends',
      data: {
        ...photo,
        signed_url: MediaStorageService.generateSignedUrl(photo.s3_key)
      }
    });
  });
}
