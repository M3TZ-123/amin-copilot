import { clerkMiddleware, clerkClient, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse, type NextRequest } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

async function resolveRole(
  userId: string,
  sessionClaims: Record<string, unknown> | null
): Promise<"admin" | "user"> {
  // Fast path: check session claims (works if custom session token is configured in Clerk)
  const claimsRole = (sessionClaims?.metadata as { role?: string })?.role;
  if (claimsRole === "admin") return "admin";

  // Fallback: fetch user from Clerk API to read publicMetadata
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const metadataRole = (user.publicMetadata as { role?: string })?.role;
    return metadataRole === "admin" ? "admin" : "user";
  } catch {
    return "user";
  }
}

const handler = clerkMiddleware(async (auth, req) => {
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  if (!userId) {
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  const role = await resolveRole(userId, sessionClaims as Record<string, unknown> | null);

  if (role === "admin") {
    // Admins can access /admin/* and /api/* only.
    // Any other route (/, /dashboard, /history, etc.) → redirect to /admin
    if (!isAdminRoute(req) && !isApiRoute(req)) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
  } else {
    // Regular users cannot access /admin/* routes → redirect to /dashboard
    if (isAdminRoute(req)) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  return NextResponse.next();
});

export async function proxy(request: NextRequest) {
  return handler(request, { waitUntil: () => {}, passThroughOnException: () => {} } as any);
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
