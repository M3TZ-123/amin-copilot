import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { isAdmin } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Admins are restricted to /admin routes — redirect them immediately
  if (await isAdmin()) {
    redirect("/admin");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      <Sidebar variant="user" />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar variant="user" />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
