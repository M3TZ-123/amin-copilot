import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  const admin = await isAdmin();

  if (!admin) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
