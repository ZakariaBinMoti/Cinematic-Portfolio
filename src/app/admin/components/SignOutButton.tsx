"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex items-center text-gray-400 hover:text-white transition-colors"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Sign Out
    </button>
  );
}
