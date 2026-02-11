import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import {
  getUserWithDetails,
  getUserByClerkId,
  getLatestSubscription,
  updateSubscriptionStatus,
  createSubscription,
} from "@/lib/queries/users";
import { addCreditEntry } from "@/lib/queries/credits";
import { createPayment } from "@/lib/queries/payments";
import { z } from "zod";

const activateSchema = z.object({
  initialCredits: z.number().int().min(0).default(0),
  paymentAmount: z.number().min(0).optional(),
  paymentMonth: z.string().optional(),
  expiresAt: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = activateSchema.parse(body);

    // Get the user
    const user = await getUserWithDetails(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check latest subscription
    const sub = await getLatestSubscription(id);
    if (sub && sub.status === "ACTIVE") {
      return NextResponse.json({ error: "User already has an active subscription" }, { status: 400 });
    }

    // If there's a pending subscription, activate it; otherwise create a new one
    if (sub) {
      await updateSubscriptionStatus(sub.id, "ACTIVE");
    } else {
      await createSubscription({
        userId: id,
        status: "ACTIVE",
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      });
    }

    // Get admin user for credit entry
    const { userId: clerkUserId } = await auth();
    const adminUser = await getUserByClerkId(clerkUserId ?? "");

    // Add initial credits if specified
    if (data.initialCredits > 0 && adminUser) {
      await addCreditEntry({
        userId: id,
        delta: data.initialCredits,
        note: "Initial credit allocation on activation",
        adminId: adminUser.id,
      });
    }

    // Record initial payment if specified
    if (data.paymentAmount && data.paymentAmount > 0 && data.paymentMonth) {
      await createPayment({
        userId: id,
        amountTnd: data.paymentAmount,
        month: data.paymentMonth,
        note: "Activation payment",
      });
    }

    return NextResponse.json({ success: true, userId: id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/users/[id]/activate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
