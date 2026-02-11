import { db } from "@/lib/db";
import type { Role, SubscriptionStatus } from "@/generated/prisma/client";

export async function getAllUsers() {
  return db.user.findMany({
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      payments: {
        orderBy: { paidAt: "desc" },
        take: 1,
      },
      creditEntries: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUserByClerkId(clerkId: string) {
  return db.user.findUnique({
    where: { clerkId },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      creditEntries: {
        orderBy: { createdAt: "desc" },
        include: { admin: true },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });
}

export async function getUserWithDetails(id: string) {
  return db.user.findUnique({
    where: { id },
    include: {
      subscriptions: {
        orderBy: { createdAt: "desc" },
      },
      creditEntries: {
        orderBy: { createdAt: "desc" },
        include: { admin: { select: { fullName: true } } },
      },
      payments: {
        orderBy: { paidAt: "desc" },
      },
    },
  });
}

export async function createUser(data: {
  clerkId: string;
  email: string;
  fullName: string;
  role?: Role;
}) {
  return db.user.create({
    data: {
      clerkId: data.clerkId,
      email: data.email,
      fullName: data.fullName,
      role: data.role ?? "USER",
    },
  });
}

export async function updateUser(
  id: string,
  data: { email?: string; fullName?: string; role?: Role }
) {
  return db.user.update({ where: { id }, data });
}

export async function updateUserByClerkId(
  clerkId: string,
  data: { email?: string; fullName?: string }
) {
  return db.user.update({ where: { clerkId }, data });
}

export async function deleteUserByClerkId(clerkId: string) {
  return db.user.delete({ where: { clerkId } });
}

export async function getTotalUsers() {
  return db.user.count({ where: { role: "USER" } });
}

export async function getActiveSubscriptionCount() {
  return db.subscription.count({
    where: { status: "ACTIVE" },
  });
}

export async function createSubscription(data: {
  userId: string;
  status?: SubscriptionStatus;
  expiresAt?: Date;
}) {
  return db.subscription.create({
    data: {
      userId: data.userId,
      status: data.status ?? "ACTIVE",
      expiresAt: data.expiresAt,
    },
  });
}

export async function updateSubscriptionStatus(
  id: string,
  status: SubscriptionStatus
) {
  return db.subscription.update({
    where: { id },
    data: { status },
  });
}

export async function getLatestSubscription(userId: string) {
  return db.subscription.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}
