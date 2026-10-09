
'use client';

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { User } from '@/types/auth';
import { api } from '@/lib/api-client';
import { useRouter, usePathname } from 'next/navigation';
import { tripJournal } from '@/lib/trip-journal';
import { stopAllMobileLocationWatches } from '@/lib/mobile-location';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string, otp?: string) => Promise<void>;
  googleLogin: (access_token: string) => Promise<void>;
  register: (email: string, password: string, passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

async function attemptSilentRefresh(): Promise<boolean> {
  try {
    const response = await fetch('/next_api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true;
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = async (email: string, password: string, otp?: string) => {
    await api.post('/auth/login', { email, password, otp });
    await refreshUser();
  };

  const register = async (email: string, password: string, passcode: string) => {
    await api.post('/auth/register', { email, password, passcode });
  };

  const logout = async () => {
    if (user) {
      try {
        if ((await tripJournal().list(user.sub, 'active')).length || sessionStorage.getItem('active_trip')) {
          toast.warning('أنه الرحلة النشطة قبل تسجيل الخروج / End the active trip before signing out');
          return;
        }
      } catch {
        toast.error('تعذّر التحقق من حفظ الرحلة؛ أبقِ التطبيق مفتوحاً / Cannot verify saved trips');
        return;
      }
    }
    await stopAllMobileLocationWatches();
    // Unsent encrypted trips stay scoped to this driver and resume on their next login.
    sessionStorage.removeItem('active_trip');
    sessionStorage.removeItem('offline_trips');
    localStorage.removeItem('active_trip');
    localStorage.removeItem('offline_trips');
    try {
      await api.post('/auth/logout');
    } finally {
      setUser(null);
      router.push('/login');
    }
  };

  const applyEntryRedirect = useCallback((userData: User) => {
    const onAuthEntryPage =
      pathname === '/' ||
      pathname === '/login' ||
      pathname === '/driver-login';

    if (!onAuthEntryPage) {
      return;
    }

    if (userData?.userType === 'distributor') {
      router.push('/distributor/dashboard');
    } else if (userData?.userType === 'driver' && !userData?.isAdmin) {
      router.push('/driver/taximeter');
    } else if (
      userData?.userType === 'manager' ||
      userData?.userType === 'company' ||
      userData?.userType === 'owner'
    ) {
      router.push('/company/dashboard');
    } else {
      router.push('/dashboard');
    }
  }, [pathname, router]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.get<User>('/auth/user');
      setUser(userData);
      applyEntryRedirect(userData);
    } catch (error: any) {
      if (
        error?.errorCode === 'TOKEN_EXPIRED' ||
        error?.status === 401
      ) {
        const refreshed = await attemptSilentRefresh();
        if (refreshed) {
          try {
            const userData = await api.get<User>('/auth/user');
            setUser(userData);
            applyEntryRedirect(userData);
          } catch {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [applyEntryRedirect]);

  const googleLogin = async (access_token: string) => {
    await api.post('/auth/google-login', {
      access_token,
      callback_url: window.location.origin,
    });
    await refreshUser();
  };

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  const value = {
    user,
    isLoading,
    login,
    googleLogin,
    register,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
