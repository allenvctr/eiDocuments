'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, UserRole } from '@/services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, senha: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAdmin: () => boolean;
  isEditor: () => boolean;
  canEdit: () => boolean;
  canManageUsers: () => boolean;
  canDeleteDocuments: () => boolean;
  canAccessAllDepartments: () => boolean;
  canAccessDepartment: (departmentId: string) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  hasMinimumRole: (minRole: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export { AuthContext };

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, senha: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ username, senha });
      setUser(response.data.usuario);
      
      // Redirecionar baseado no role
      const dashboardPath = authService.getDashboardPath(response.data.usuario);
      router.push(dashboardPath);
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Retornar o erro para que a página de login possa lidar com ele
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      router.push('/login');
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  // Métodos de verificação de permissões
  const isAdmin = () => user ? authService.isAdmin(user) : false;
  const isEditor = () => user ? authService.isEditor(user) : false;
  const canEdit = () => user ? authService.canEdit(user) : false;
  const canManageUsers = () => user ? authService.canManageUsers(user) : false;
  const canDeleteDocuments = () => user ? authService.canDeleteDocuments(user) : false;
  const canAccessAllDepartments = () => user ? authService.canAccessAllDepartments(user) : false;
  const canAccessDepartment = (departmentId: string) => user ? authService.canAccessDepartment(user, departmentId) : false;
  const hasRole = (role: UserRole) => user ? authService.hasRole(user, role) : false;
  const hasAnyRole = (roles: UserRole[]) => user ? authService.hasAnyRole(user, roles) : false;
  const hasMinimumRole = (minRole: UserRole) => user ? authService.hasMinimumRole(user, minRole) : false;

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAdmin,
    isEditor,
    canEdit,
    canManageUsers,
    canDeleteDocuments,
    canAccessAllDepartments,
    canAccessDepartment,
    hasRole,
    hasAnyRole,
    hasMinimumRole
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
