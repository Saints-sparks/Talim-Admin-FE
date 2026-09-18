import { redirect } from 'next/navigation';

/**
 * The portal has one landing place. The session lives in the httpOnly refresh
 * cookie on the API origin, which this server cannot read, so routing is left
 * to `RouteGuard`: it sends anyone without a platform-admin session on to the
 * sign-in screen once the cold-start refresh has settled.
 */
export default function Home() {
  redirect('/talimadmindashboard');
}
