import { apiPost, apiGet } from '@/lib/api';

export type UserRole = 'superadmin' | 'org_admin' | 'admin' | 'editor' | 'user';

export interface User {
  _id: string;
  username: string;
  nome: string;
  apelido: string;
  tenant?: string;
  departamento?: {
    _id: string;
    nome: string;
    codigo: string;
  };
  role: UserRole;
  ativo: boolean;
}

export interface LoginRequest {
  username: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    usuario: User;
  };
}

// Roles com acesso administrativo completo dentro do seu scope
const ADMIN_ROLES: UserRole[] = ['superadmin', 'org_admin', 'admin'];

class AuthService {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return apiPost<AuthResponse>('/auth/login', credentials);
  }

  async logout(): Promise<void> {
    await apiPost('/auth/logout', {});
  }

  async refreshToken(): Promise<void> {
    await apiPost('/auth/refresh', {});
  }

  async getCurrentUser(): Promise<User> {
    const response = await apiGet<{ success: boolean; data: User }>('/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiPost('/auth/change-password', {
      senhaAtual: currentPassword,
      novaSenha: newPassword
    });
  }

  // ── Verificação de roles ───────────────────────────────────────────────────

  isAdmin(user: User): boolean {
    return ADMIN_ROLES.includes(user.role);
  }

  isEditor(user: User): boolean {
    return user.role === 'editor';
  }

  isUser(user: User): boolean {
    return user.role === 'user';
  }

  isSuperAdmin(user: User): boolean {
    return user.role === 'superadmin';
  }

  isOrgAdmin(user: User): boolean {
    return user.role === 'org_admin';
  }

  canEdit(user: User): boolean {
    return ADMIN_ROLES.includes(user.role) || user.role === 'editor';
  }

  canManageUsers(user: User): boolean {
    return ADMIN_ROLES.includes(user.role);
  }

  canDeleteDocuments(user: User): boolean {
    return ADMIN_ROLES.includes(user.role) || user.role === 'editor';
  }

  canAccessAllDepartments(user: User): boolean {
    return ADMIN_ROLES.includes(user.role);
  }

  canAccessDepartment(user: User, departmentId: string): boolean {
    if (ADMIN_ROLES.includes(user.role)) return true;
    if (!user.departamento) return false;
    return user.departamento._id === departmentId;
  }

  hasRole(user: User, role: UserRole): boolean {
    return user.role === role;
  }

  hasAnyRole(user: User, roles: UserRole[]): boolean {
    return roles.includes(user.role);
  }

  hasMinimumRole(user: User, minRole: UserRole): boolean {
    const hierarchy: Record<UserRole, number> = {
      superadmin: 5,
      org_admin:  4,
      admin:      3,
      editor:     2,
      user:       1,
    };
    return (hierarchy[user.role] ?? 0) >= (hierarchy[minRole] ?? 0);
  }

  // ── Routing ───────────────────────────────────────────────────────────────

  getDashboardPath(user: User): string {
    if (ADMIN_ROLES.includes(user.role)) return '/dashboard/admin';
    if (user.role === 'editor') return '/dashboard/editor';
    return '/dashboard/user';
  }
}

export const authService = new AuthService();
