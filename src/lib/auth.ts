import { auth, currentUser } from "@clerk/nextjs/server";

/**
 * Gets the current user's role. Checks session claims first (fast),
 * then falls back to Clerk user publicMetadata (reliable).
 */
export async function getRole(): Promise<"admin" | "user"> {
  const { sessionClaims } = await auth();

  // Check session claims first (requires custom session token in Clerk)
  const claimsRole = (sessionClaims?.metadata as { role?: string })?.role;
  if (claimsRole === "admin") return "admin";

  // Fallback: fetch full user object from Clerk API (always has publicMetadata)
  const user = await currentUser();
  if (!user) return "user";

  const metadataRole = (user.publicMetadata as { role?: string })?.role;
  return metadataRole === "admin" ? "admin" : "user";
}

/**
 * Gets the current user's Clerk ID.
 */
export async function getClerkUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

/**
 * Checks if the current user is an admin.
 */
export async function isAdmin(): Promise<boolean> {
  return (await getRole()) === "admin";
}
