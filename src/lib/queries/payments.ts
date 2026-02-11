import { db } from "@/lib/db";
import { Prisma } from "@/generated/prisma/client";

export async function getPaymentsByUser(userId: string, limit?: number) {
  return db.payment.findMany({
    where: { userId },
    orderBy: { paidAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function createPayment(data: {
  userId: string;
  amountTnd: number;
  month: string;
  note?: string;
}) {
  return db.payment.create({
    data: {
      userId: data.userId,
      amountTnd: new Prisma.Decimal(data.amountTnd),
      month: data.month,
      note: data.note,
    },
  });
}

export async function getTotalRevenue(): Promise<number> {
  const result = await db.payment.aggregate({
    _sum: { amountTnd: true },
  });
  return result._sum.amountTnd?.toNumber() ?? 0;
}

export async function getRevenueByMonth() {
  const payments = await db.payment.findMany({
    select: { month: true, amountTnd: true },
    orderBy: { month: "asc" },
  });

  const grouped: Record<string, number> = {};
  for (const p of payments) {
    grouped[p.month] = (grouped[p.month] ?? 0) + p.amountTnd.toNumber();
  }

  return Object.entries(grouped).map(([month, total]) => ({
    month,
    total,
  }));
}

export async function getRecentPayments(limit: number = 5) {
  return db.payment.findMany({
    include: {
      user: { select: { fullName: true, email: true } },
    },
    orderBy: { paidAt: "desc" },
    take: limit,
  });
}
