import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { addCreditEntry, getCreditBalance, getCreditHistory } from "@/lib/queries/credits";
import { getUserByClerkId } from "@/lib/queries/users";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const creditSchema = z.object({
  delta: z.number().int(),
  note: z.string().optional(),
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
    const [balance, history] = await Promise.all([
      getCreditBalance(id),
      getCreditHistory(id),
    ]);

    return NextResponse.json({ balance, history });
  } catch (error) {
    console.error("GET /api/users/[id]/credits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId: clerkUserId } = await auth();
    const adminUser = await getUserByClerkId(clerkUserId ?? "");
    if (!adminUser) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    }

    const { id } = await params;
    const body = await req.json();
    const data = creditSchema.parse(body);

    const entry = await addCreditEntry({
      userId: id,
      delta: data.delta,
      note: data.note,
      adminId: adminUser.id,
    });

    const newBalance = await getCreditBalance(id);

    return NextResponse.json({ entry, balance: newBalance }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/users/[id]/credits error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
