'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getToken } from '@/lib/auth';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getToken();
      const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');
      
      if (!token && !isAuthPage) {
        setAuthorized(false);
        router.push('/login');
      } else if (token && isAuthPage) {
        router.push('/dashboard');
      } else {
        setAuthorized(true);
      }
    };

    checkAuth();
  }, [pathname, router]);

  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return <>{children}</>;
}
