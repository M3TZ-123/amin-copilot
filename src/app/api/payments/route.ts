import { NextResponse } from "next/server";
import { createPayment, getRevenueByMonth, getRecentPayments } from "@/lib/queries/payments";
import { isAdmin } from "@/lib/auth";
import { z } from "zod";

const paymentSchema = z.object({
  userId: z.string().uuid(),
  amountTnd: z.number().positive(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
  note: z.string().optional(),
});

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [revenueByMonth, recentPayments] = await Promise.all([
      getRevenueByMonth(),
      getRecentPayments(10),
    ]);

    return NextResponse.json({ revenueByMonth, recentPayments });
  } catch (error) {
    console.error("GET /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = paymentSchema.parse(body);

    const payment = await createPayment({
      userId: data.userId,
      amountTnd: data.amountTnd,
      month: data.month,
      note: data.note,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("POST /api/payments error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
