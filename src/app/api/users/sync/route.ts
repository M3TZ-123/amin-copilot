import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { upsertUserFromClerk, getLatestSubscription, createSubscription } from "@/lib/queries/users";

export async function POST() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const client = await clerkClient();

    // Fetch all Clerk users (paginated)
    let allClerkUsers: {
      id: string;
      emailAddresses: { emailAddress: string }[];
      firstName: string | null;
      lastName: string | null;
      publicMetadata: Record<string, unknown>;
    }[] = [];

    let offset = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      const response = await client.users.getUserList({ limit, offset });
      allClerkUsers = [...allClerkUsers, ...response.data];
      hasMore = response.data.length === limit;
      offset += limit;
    }

    let created = 0;
    let updated = 0;

    for (const clerkUser of allClerkUsers) {
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
      const fullName =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "User";
      const role =
        (clerkUser.publicMetadata as { role?: string })?.role === "admin"
          ? "ADMIN"
          : "USER";

      const user = await upsertUserFromClerk({
        clerkId: clerkUser.id,
        email,
        fullName,
        role: role as "ADMIN" | "USER",
      });

      // Check if this user has any subscription — if not, create PENDING_ACTIVATION
      if (role === "USER") {
        const sub = await getLatestSubscription(user.id);
        if (!sub) {
          await createSubscription({
            userId: user.id,
            status: "PENDING_ACTIVATION",
          });
          created++;
        } else {
          updated++;
        }
      } else {
        updated++;
      }
    }

    return NextResponse.json({
      synced: allClerkUsers.length,
      created,
      updated,
    });
  } catch (error) {
    console.error("POST /api/users/sync error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
