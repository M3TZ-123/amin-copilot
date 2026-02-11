import type { Role, SubscriptionStatus } from "@/generated/prisma/client";

export type UserWithDetails = {
  id: string;
  clerkId: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: Date;
  subscriptions: {
    id: string;
    status: SubscriptionStatus;
    startedAt: Date;
    expiresAt: Date | null;
    createdAt: Date;
  }[];
  creditEntries: {
    id: string;
    delta: number;
    note: string | null;
    createdAt: Date;
    admin: { fullName: string };
  }[];
  payments: {
    id: string;
    amountTnd: { toNumber(): number } | number;
    month: string;
    paidAt: Date;
    note: string | null;
  }[];
};

export type AdminAnalytics = {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  totalCredits: number;
};

export type RevenueByMonth = {
  month: string;
  total: number;
};

export type CreditEntry = {
  id: string;
  delta: number;
  note: string | null;
  createdAt: Date | string;
  admin: { fullName: string };
};

export type PaymentEntry = {
  id: string;
  amountTnd: number | { toNumber(): number };
  month: string;
  paidAt: Date | string;
  note: string | null;
};
