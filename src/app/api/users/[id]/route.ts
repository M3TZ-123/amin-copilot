import { NextResponse } from "next/server";
import { getUserWithDetails, updateUser } from "@/lib/queries/users";
import { updateSubscriptionStatus, getLatestSubscription } from "@/lib/queries/users";
import { getCreditBalance } from "@/lib/queries/credits";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const updateUserSchema = z.object({
  fullName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  subscriptionStatus: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const user = await getUserWithDetails(id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const creditBalance = await getCreditBalance(id);

    return NextResponse.json({ ...user, creditBalance });
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = updateUserSchema.parse(body);

    if (data.fullName || data.email) {
      await updateUser(id, {
        ...(data.fullName && { fullName: data.fullName }),
        ...(data.email && { email: data.email }),
      });
    }

    if (data.subscriptionStatus) {
      const sub = await getLatestSubscription(id);
      if (sub) {
        await updateSubscriptionStatus(sub.id, data.subscriptionStatus);
      }
    }

    const updatedUser = await getUserWithDetails(id);
    const creditBalance = await getCreditBalance(id);

    return NextResponse.json({ ...updatedUser, creditBalance });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("PATCH /api/users/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
