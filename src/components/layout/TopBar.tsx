"use client";

import { UserButton } from "@clerk/nextjs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./Sidebar";

interface TopBarProps {
  variant: "user" | "admin";
}

export function TopBar({ variant }: TopBarProps) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6">
      <div className="flex items-center gap-3">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-slate-900 border-slate-800">
            <Sidebar variant={variant} />
          </SheetContent>
        </Sheet>
        <h1 className="text-lg font-semibold text-slate-100 md:hidden">
          CopilotTN
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <UserButton
          afterSignOutUrl="/sign-in"
          appearance={{
            elements: {
              avatarBox: "h-8 w-8",
            },
          }}
        />
      </div>
    </header>
  );
}
