"use client";

import { SessionProvider } from "next-auth/react";
import { useUserStatus } from "@/hook/useUserStatus";

export default function AuthProvider({
  children,
  session
}: {
  children: React.ReactNode;
  session: any
}) {

  if (session?.user && session.user.id) {
    useUserStatus(session.user.id)
  }
  return <SessionProvider>{children}</SessionProvider>;
}
