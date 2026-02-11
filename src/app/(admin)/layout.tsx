import { AdminGuard } from "@/components/layout/AdminGuard";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen overflow-hidden bg-slate-950">
        <Sidebar variant="admin" />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar variant="admin" />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
