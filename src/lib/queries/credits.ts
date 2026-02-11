import { db } from "@/lib/db";

export async function getCreditBalance(userId: string): Promise<number> {
  const result = await db.creditLedger.aggregate({
    where: { userId },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}

export async function getCreditHistory(userId: string, limit?: number) {
  return db.creditLedger.findMany({
    where: { userId },
    include: {
      admin: { select: { fullName: true } },
    },
    orderBy: { createdAt: "desc" },
    ...(limit ? { take: limit } : {}),
  });
}

export async function addCreditEntry(data: {
  userId: string;
  delta: number;
  note?: string;
  adminId: string;
}) {
  return db.creditLedger.create({
    data: {
      userId: data.userId,
      delta: data.delta,
      note: data.note,
      adminId: data.adminId,
    },
  });
}

export async function getTotalCreditsDistributed(): Promise<number> {
  const result = await db.creditLedger.aggregate({
    where: { delta: { gt: 0 } },
    _sum: { delta: true },
  });
  return result._sum.delta ?? 0;
}
