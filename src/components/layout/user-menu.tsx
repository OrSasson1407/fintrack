"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, Settings } from "lucide-react";
import Link from "next/link";

interface UserMenuProps {
  fullName: string | null;
  email: string;
}

export function UserMenu({ fullName, email }: UserMenuProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : email[0].toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="relative h-10 w-10 rounded-lg transition-transform hover:scale-105 hover:bg-transparent"
        >
          <Avatar className="h-10 w-10 rounded-lg border border-[var(--border)] hover:border-white/20 transition-colors shadow-sm">
            <AvatarFallback 
              className="rounded-lg font-display text-[1rem] tracking-wider"
              style={{ backgroundColor: "var(--surface-2)", color: "var(--acid)" }}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 rounded-xl border border-[var(--border)] shadow-xl"
        style={{ backgroundColor: "var(--surface)" }}
      >
        <div className="px-3 py-2.5">
          <p className="text-sm font-display tracking-wide text-white">{fullName || "User"}</p>
          <p className="text-xs font-mono text-muted-foreground truncate">{email}</p>
        </div>
        <DropdownMenuSeparator className="bg-[var(--border)]" />
        <DropdownMenuItem asChild className="focus:bg-white/5 focus:text-white cursor-pointer py-2.5 rounded-md mx-1">
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-xs uppercase tracking-widest">Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[var(--border)]" />
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="focus:bg-rose-500/10 focus:text-rose-500 text-rose-500 cursor-pointer py-2.5 rounded-md mx-1"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold">Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}