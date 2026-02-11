import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { getAllUsers, getUserByClerkId, createUser, createSubscription } from "@/lib/queries/users";
import { addCreditEntry } from "@/lib/queries/credits";
import { createPayment } from "@/lib/queries/payments";
import { getCreditBalance } from "@/lib/queries/credits";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const createUserSchema = z.object({
  clerkId: z.string().optional(),
  email: z.string().email(),
  fullName: z.string().min(1),
  initialCredits: z.number().int().min(0).default(0),
  paymentAmount: z.number().min(0).optional(),
  paymentMonth: z.string().optional(),
  subscriptionStatus: z.enum(["PENDING_ACTIVATION", "ACTIVE", "SUSPENDED", "EXPIRED"]).default("ACTIVE"),
  expiresAt: z.string().optional(),
});

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const users = await getAllUsers();

    const usersWithBalances = await Promise.all(
      users.map(async (user) => {
        const balance = await getCreditBalance(user.id);
        return {
          ...user,
          creditBalance: balance,
          latestSubscription: user.subscriptions[0] ?? null,
          lastPayment: user.payments[0] ?? null,
        };
      })
    );

    return NextResponse.json(usersWithBalances);
  } catch (error) {
    console.error("GET /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = createUserSchema.parse(body);

    const { userId: clerkUserId } = await auth();
    const adminUser = await getUserByClerkId(clerkUserId ?? "");
    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const user = await createUser({
      clerkId: data.clerkId || `manual_${Date.now()}`,
      email: data.email,
      fullName: data.fullName,
    });

    await createSubscription({
      userId: user.id,
      status: data.subscriptionStatus,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
    });

    if (data.initialCredits > 0) {
      await addCreditEntry({
        userId: user.id,
        delta: data.initialCredits,
        note: "Initial credit allocation",
        adminId: adminUser.id,
      });
    }

    if (data.paymentAmount && data.paymentMonth) {
      await createPayment({
        userId: user.id,
        amountTnd: data.paymentAmount,
        month: data.paymentMonth,
        note: "Initial payment",
      });
    }

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/users error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
