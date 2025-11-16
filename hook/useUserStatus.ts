'use client'
import { useEffect } from "react";

export function useUserStatus(userId: string) {
  useEffect(() => {
    let timeout: NodeJS.Timeout | null = null;

    const ping = (state: "online" | "offline" | "sleep") => {
      fetch("/api/user/status", {
        method: "POST",
        body: JSON.stringify({ status: state })
      });
    };

    const goOnline = () => {
      clearTimeout(timeout as any);
      ping("online");
      timeout = setTimeout(() => ping("sleep"), 60_000);
    };

    const goSleep = () => ping("sleep");
    const goOffline = () => ping("offline");

    const resetTimer = () => {
      clearTimeout(timeout as any);
      timeout = setTimeout(() => goSleep(), 60_000);
    };

    window.addEventListener("focus", goOnline);
    window.addEventListener("blur", goSleep);
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);

    window.addEventListener("beforeunload", goOffline);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    goOnline(); // initial

    return () => {
      window.removeEventListener("focus", goOnline);
      window.removeEventListener("blur", goSleep);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("beforeunload", goOffline);
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, [userId]);
}
