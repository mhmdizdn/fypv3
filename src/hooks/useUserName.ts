import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

export function useUserName() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const userName = mounted && status === "authenticated" && session?.user 
    ? ((session.user as any)?.name || (session.user as any)?.username || "Account")
    : status === "loading" ? "Loading..." : "Account";

  return { userName, isLoading: status === "loading", isAuthenticated: status === "authenticated" };
}