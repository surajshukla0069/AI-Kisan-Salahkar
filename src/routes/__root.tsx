import { Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/hooks/use-auth";
import { UserPreferencesProvider } from "@/hooks/use-user-preferences";
import { useState } from "react";
import { Toaster } from "sonner";
import { useLocation } from "react-router-dom";

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000 } },
  }));
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserPreferencesProvider>
          <div className="min-h-screen bg-white">
            <Outlet />
            {!isLoginPage && <BottomNav />}
          </div>
          <Toaster position="top-center" richColors />
        </UserPreferencesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
