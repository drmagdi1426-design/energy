import { cookies } from 'next/headers';
import { getIronSession, type IronSession } from 'iron-session';

// Admin session cookie. Encrypted + signed by iron-session (AES-256-GCM),
// short-lived, HttpOnly, SameSite=Lax. This is a real expiring session, not
// a permanent cookie: it is re-validated (absolute + sliding) on every
// admin request in requireAdminSession().
export interface SessionData {
  admin?: {
    username: string;
    loginAt: number; // epoch ms — absolute session start, for the hard expiry check
  };
}

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60; // 8 hours

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      'SESSION_SECRET is not set (or is too short). Set a random string of at least 32 characters — see .env.example.',
    );
  }
  return secret;
}

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, {
    password: getSessionSecret(),
    cookieName: 'tharwah_admin_session',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.FORCE_SECURE_COOKIES !== 'false',
      maxAge: SESSION_MAX_AGE_SECONDS,
    },
  });
}

/** True if the session holds a still-valid (not hard-expired) admin login. */
export function isSessionValid(session: IronSession<SessionData>): boolean {
  if (!session.admin) return false;
  const ageMs = Date.now() - session.admin.loginAt;
  return ageMs < SESSION_MAX_AGE_SECONDS * 1000;
}

export async function requireAdminSession(): Promise<{ username: string } | null> {
  const session = await getSession();
  if (!isSessionValid(session)) return null;
  return { username: session.admin!.username };
}
