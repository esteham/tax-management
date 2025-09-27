import React, { useState, createContext, useContext, useEffect } from 'react';
import { Toaster } from './components/ui/sonner';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { ForgotPasswordPage } from './components/ForgotPasswordPage';
import { FAQPage } from './components/FAQPage';
import { AdminDashboard } from './components/dashboards/AdminDashboard';
import { TaxpayerDashboard } from './components/dashboards/TaxpayerDashboard';
import { AuditorDashboard } from './components/dashboards/AuditorDashboard';
import { AccountantDashboard } from './components/dashboards/AccountantDashboard';
import { SuperAdminDashboard } from './components/dashboards/SuperAdminDashboard';
import { toast } from 'sonner@2.0.3';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

export type UserRole = 'admin' | 'taxpayer' | 'auditor' | 'accountant' | 'super_admin';

export interface User {
  id: number | string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('landing');

  useEffect(() => {
    // Bootstrap auth state from stored token
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.success && data?.user) {
            setUser(data.user);
          }
        } else {
          localStorage.removeItem('auth_token');
        }
      } catch (e) {
        // ignore bootstrap errors
      }
    })();
  }, []);

  const navigateByRole = (role: UserRole) => {
    switch (role) {
      case 'admin':
        setCurrentPage('admin-dashboard');
        break;
      case 'taxpayer':
        setCurrentPage('taxpayer-dashboard');
        break;
      case 'auditor':
        setCurrentPage('auditor-dashboard');
        break;
      case 'accountant':
        setCurrentPage('accountant-dashboard');
        break;
      case 'super_admin':
        setCurrentPage('super-admin-dashboard');
        break;
      default:
        setCurrentPage('taxpayer-dashboard');
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        toast.error(data?.message || 'Login failed');
        return false;
      }
      if (data?.token) {
        localStorage.setItem('auth_token', data.token);
      }
      if (data?.user) {
        setUser(data.user);
        navigateByRole(data.user.role as UserRole);
      }
      toast.success('Login successful');
      return true;
    } catch (e) {
      toast.error('Network error during login');
      return false;
    }
  };

  const logout = () => {
    const token = localStorage.getItem('auth_token');
    // Fire and forget logout
    if (token) {
      fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).finally(() => {
        localStorage.removeItem('auth_token');
        setUser(null);
        setCurrentPage('landing');
      });
    } else {
      setUser(null);
      setCurrentPage('landing');
    }
  };

  const renderPage = () => {
    if (user) {
      switch (user.role) {
        case 'admin':
          return <AdminDashboard />;
        case 'taxpayer':
          return <TaxpayerDashboard />;
        case 'auditor':
          return <AuditorDashboard />;
        case 'accountant':
          return <AccountantDashboard />;
        case 'super_admin':
          return <SuperAdminDashboard />;
        default:
          return <TaxpayerDashboard />;
      }
    }

    switch (currentPage) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginPage />;
      case 'register':
        return <RegisterPage />;
      case 'forgot-password':
        return <ForgotPasswordPage />;
      case 'faq':
        return <FAQPage />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, currentPage, setCurrentPage }}>
      <div className="min-h-screen bg-background">
        {renderPage()}
        <Toaster />
      </div>
    </AuthContext.Provider>
  );
}