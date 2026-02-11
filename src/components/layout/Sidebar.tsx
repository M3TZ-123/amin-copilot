"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  History,
  Users,
  BarChart3,
  UserPlus,
  Shield,
} from "lucide-react";

const userNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "History", href: "/history", icon: History },
];

const adminNav = [
  { label: "Overview", href: "/admin", icon: BarChart3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Add User", href: "/admin/add-user", icon: UserPlus },
];

interface SidebarProps {
  variant: "user" | "admin";
}

export function Sidebar({ variant }: SidebarProps) {
  const pathname = usePathname();
  const links = variant === "admin" ? adminNav : userNav;

  return (
    <aside className="hidden md:flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-900/50">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-slate-800">
        {variant === "admin" && <Shield className="h-5 w-5 text-blue-400" />}
        <span className="text-lg font-bold tracking-tight text-slate-100">
          CopilotTN
        </span>
        {variant === "admin" && (
          <span className="ml-1 rounded bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
            Admin
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map((link) => {
          const isActive =
            pathname === link.href ||
            (link.href !== "/admin" && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-slate-800 text-slate-100"
                  : "text-slate-400 hover:bg-slate-800/50 hover:text-slate-200"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
