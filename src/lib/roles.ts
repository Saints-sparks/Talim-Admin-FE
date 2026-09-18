import type { SessionUser } from './session';

/**
 * The only role the Talim Admin portal admits. Mirrors `UserRole.ADMIN` in
 * `talimBE-V2/src/modules/user/data/models/user.schema.ts`; every platform
 * endpoint this app calls is decorated `@Roles(UserRole.ADMIN)`.
 */
export const PLATFORM_ADMIN_ROLE = 'admin';

/** A user shape with just enough on it to make an access decision. */
export interface RoleBearer {
  role?: string | null;
}

/**
 * True when the user is a Talim platform administrator.
 *
 * The server already gates `/auth/admin-login` on this, but the browser must
 * check too: a session minted by another Talim app (school admin, teacher,
 * parent) carries a valid refresh cookie for the same API origin, so without
 * this check such a user could load the portal shell and see platform screens
 * before each request came back 403.
 *
 * @param user - The signed-in user, or `null` when signed out.
 * @returns True when the portal should render for them.
 */
export function isPlatformAdmin(user: RoleBearer | SessionUser | null | undefined): boolean {
  return user?.role === PLATFORM_ADMIN_ROLE;
}

/**
 * Routes that render without a session. Everything else requires a signed-in
 * platform administrator.
 */
export const PUBLIC_ROUTES = ['/talimadminlogin'];

/**
 * True when `pathname` renders without a session.
 *
 * @param pathname - The route being opened.
 * @returns True for public routes.
 */
export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}
