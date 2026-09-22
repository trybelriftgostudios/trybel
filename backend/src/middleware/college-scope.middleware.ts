import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '../types/index.js';

/**
 * Enforces that the authenticated user belongs to the target college.
 * Hard barrier for study partners, college-only chat, and college-only feeds.
 */
export function requireSameCollege(targetCollegeId: string, userCollegeId: string): boolean {
  return targetCollegeId === userCollegeId;
}

/**
 * Evaluates whether a team listing is visible to a user.
 * - Same college: always visible.
 * - Other college: only if visibility is 'open_to_all'.
 */
export function canViewTeam(team: { college_id: string; visibility: 'college_only' | 'open_to_all' }, userCollegeId: string): boolean {
  if (team.college_id === userCollegeId) return true;
  return team.visibility === 'open_to_all';
}

/**
 * Evaluates whether a user can discover/view a club event.
 * - Same college: always visible.
 * - Other college: only if event visibility is 'everyone'.
 */
export function canViewEvent(event: { college_id: string; visibility: 'college' | 'everyone' }, userCollegeId: string): boolean {
  if (event.college_id === userCollegeId) return true;
  return event.visibility === 'everyone';
}

/**
 * Evaluates whether a user can register for an event.
 * - Same college: allowed.
 * - Other college: only if registration_eligibility is 'cross_college'.
 */
export function canRegisterEvent(event: { college_id: string; registration_eligibility: 'college_only' | 'cross_college' }, userCollegeId: string): boolean {
  if (event.college_id === userCollegeId) return true;
  return event.registration_eligibility === 'cross_college';
}

/**
 * Enforces required user roles.
 */
export function requireRoles(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    if (!request.user) {
      return reply.status(401).send({ error: 'Unauthorized', message: 'Authentication required' });
    }
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ error: 'Forbidden', message: `Role '${request.user.role}' is not authorized for this operation` });
    }
  };
}
