import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { USER_ROLES } from "@/lib/constants";

// JWT Configuration
const ACCESS_TOKEN_SECRET =
  process.env.JWT_ACCESS_SECRET || "dev-access-secret-key";
const REFRESH_TOKEN_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-key";
const ACCESS_TOKEN_EXPIRY = "8h";
const REFRESH_TOKEN_EXPIRY = "7d";

// ============================================================================
// PASSWORD HASHING
// ============================================================================

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ============================================================================
// JWT TOKEN GENERATION
// ============================================================================

export function generateAccessToken(user: AuthUser): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
    },
    ACCESS_TOKEN_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

export function generateTokens(user: AuthUser): AuthTokens {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user.id),
  };
}

// ============================================================================
// JWT TOKEN VERIFICATION
// ============================================================================

export function verifyAccessToken(
  token: string
): { userId: string; email: string; role: UserRole } | null {
  try {
    const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET) as {
      userId: string;
      email: string;
      role: UserRole;
    };
    return decoded;
  } catch (error: any) {
    console.error(
      `Invalid or expired access token: ${error?.message || "Unknown error"}`
    );
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET) as {
      userId: string;
    };
    return decoded;
  } catch (error: any) {
    console.error(
      `Invalid or expired refresh token: ${error?.message || "Unknown error"}`
    );
    return null;
  }
}

// Alias for middleware use
export const verifyToken = verifyAccessToken;

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

export async function setAuthCookies(tokens: AuthTokens): Promise<void> {
  const cookieStore = await cookies();

  // Set access token
  cookieStore.set("accessToken", tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  // Set refresh token
  cookieStore.set("refreshToken", tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearAuthCookies(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("accessToken")?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get("refreshToken")?.value;
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = await getAccessToken();
  if (!token) {
    return null;
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return null;
  }

  // In a real app, you'd fetch the user from the database
  // For now, we'll return a minimal user object
  return {
    id: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  } as AuthUser;
}

export function userToAuthUser(user: User): AuthUser {
  const { password, ...authUser } = user;
  return authUser as AuthUser;
}

// ============================================================================
// ROLE CHECKING
// ============================================================================

export function hasRole(user: AuthUser | null, roles: UserRole[]): boolean {
  return user ? roles.includes(user.role) : false;
}

export function isSuperadmin(user: AuthUser | null): boolean {
  return hasRole(user, [USER_ROLES.SUPERADMIN as UserRole]);
}

export function isLeader(user: AuthUser | null): boolean {
  return hasRole(user, [
    USER_ROLES.LEADER as UserRole,
    USER_ROLES.SUPERADMIN as UserRole,
  ]);
}

export function isMember(user: AuthUser | null): boolean {
  return hasRole(user, [
    USER_ROLES.MEMBER as UserRole,
    USER_ROLES.LEADER as UserRole,
    USER_ROLES.SUPERADMIN as UserRole,
  ]);
}

export function canAccessGroup(
  user: AuthUser | null,
  groupId: string
): boolean {
  if (!user) return false;
  if (isSuperadmin(user)) return true;
  return user.groupId === groupId;
}

export function canManageGroup(user: AuthUser | null, group: Group): boolean {
  if (!user) return false;
  if (isSuperadmin(user)) return true;
  return user.role === USER_ROLES.LEADER && group.leaderId === user.id;
}
