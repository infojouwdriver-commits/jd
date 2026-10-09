

export interface User {
  sub: string;
  email: string;
  role: string;
  isAdmin: boolean;
  userType?: 'admin' | 'driver' | 'manager' | 'distributor' | 'company' | 'owner';
  distributorInfo?: {
    id: number;
    full_name: string;
    commission_percentage: number;
    is_active: boolean;
  } | null;
}

export interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  isAdmin: boolean;
  iat?: number;
  exp?: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
