"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function QuickAddFab() {
  return (
    <Link href="/transactions?add=true">
      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-indigo-600 hover:bg-indigo-700 z-50"
      >
        <Plus className="h-6 w-6" />
      </Button>
    </Link>
  );
}