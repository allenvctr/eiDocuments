'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  Building2,
  FolderOpen,
  FileType,
  Home,
  Menu,
  X,
  LogOut,
  Users,
} from 'lucide-react';

interface AdminSidebarProps {
  className?: string;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  className = '',
  isMobileOpen = false,
  onMobileClose,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdminRole = user?.role === 'superadmin' || user?.role === 'org_admin' || user?.role === 'admin';

  // Determinar URL do dashboard baseado no role
  const dashboardHref = isAdminRole ? '/dashboard/admin' : '/dashboard/editor';

  const baseMenuItems = [
    {
      title: isAdminRole ? 'Dashboard Admin' : 'Dashboard Editor',
      icon: Home,
      href: dashboardHref,
      description: 'Visão geral do sistema'
    }
  ];

  const managerMenuItems = [
    { title: 'Gerenciar Documentos', icon: FileText, href: '/manage/documentos', description: 'Gerenciar documentos' },
    { title: 'Categorias', icon: FolderOpen, href: '/manage/categorias', description: 'Gerenciar categorias' },
    { title: 'Tipos de Documento', icon: FileType, href: '/manage/tipos', description: 'Gerenciar tipos de documento' },
  ];

  const adminOnlyMenuItems = [
    { title: 'Gerenciar Usuários', icon: Users, href: '/manage/usuarios', description: 'Gerenciar usuários do sistema' },
    { title: 'Departamentos', icon: Building2, href: '/manage/departamentos', description: 'Gerenciar departamentos' },
  ];

  let menuItems = baseMenuItems;

  if (isAdminRole) {
    menuItems = [...baseMenuItems, ...managerMenuItems, ...adminOnlyMenuItems];
  } else if (user?.role === 'editor') {
    menuItems = [...baseMenuItems, ...managerMenuItems];
  }

  const isActive = (href: string) => {
    if (href === '/dashboard/admin' || href === '/dashboard/editor') return pathname === href;
    return pathname.startsWith(href);
  };

  const handleClose = () => {
    if (onMobileClose) onMobileClose();
    else setIsCollapsed(true);
  };

  return (
    <div
      className={`
        fixed inset-y-0 left-0 z-50 w-64
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:static lg:inset-auto lg:z-auto lg:translate-x-0
        ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}
        h-screen
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-700
        transition-transform duration-300 ease-in-out
        lg:transition-[width] lg:duration-300
        flex flex-col overflow-hidden flex-shrink-0
        ${className}
      `}
    >
      {/* Header */}
      <div className="flex items-center h-16 px-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="mx-auto p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Expandir menu"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        ) : (
          <>
            <img src="/logo.jpg" alt="Admin Panel" className="w-8 h-8 flex-shrink-0 rounded-lg object-cover" />
            <span className="ml-2 flex-1 text-xl font-bold text-gray-800 dark:text-gray-100 truncate">
              Admin Panel
            </span>
            <button
              onClick={handleClose}
              className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Fechar menu"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </>
        )}
      </div>

      {/* Nav Items */}
      <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onMobileClose}
              title={isCollapsed ? item.title : undefined}
              className={`
                flex items-center rounded-lg transition-all duration-200 group
                ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2.5'}
                ${active
                  ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100 border border-transparent'
                }
              `}
            >
              <Icon
                className={`
                  w-5 h-5 flex-shrink-0
                  ${active
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'
                  }
                `}
              />
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm leading-tight truncate">{item.title}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">{item.description}</div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={`border-t border-gray-200 dark:border-gray-700 py-3 space-y-1 flex-shrink-0 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {!isCollapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2.5 bg-red-50 dark:bg-red-900/20 rounded-lg mb-1">
            <div className="w-8 h-8 flex-shrink-0 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.nome?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.nome || user.username}
              </div>
              <div className="text-xs text-red-500 font-medium">
                {user.role === 'superadmin' && 'Super Admin'}
                {user.role === 'org_admin' && 'Org Admin'}
                {user.role === 'admin' && 'Administrador'}
                {user.role === 'editor' && 'Gerente'}
                {user.role === 'user' && 'Usuário'}
              </div>
            </div>
          </div>
        )}

        {isCollapsed && user && (
          <div
            className="mx-auto w-9 h-9 bg-red-600 rounded-full flex items-center justify-center mb-1"
            title={user.nome || user.username}
          >
            <span className="text-xs font-medium text-white">
              {user.nome?.charAt(0) || user.username?.charAt(0) || 'U'}
            </span>
          </div>
        )}

        <button
          onClick={logout}
          title={isCollapsed ? 'Sair' : undefined}
          className={`
            w-full flex items-center rounded-lg
            text-red-600 dark:text-red-400
            hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors
            ${isCollapsed ? 'justify-center p-2' : 'gap-3 px-3 py-2'}
          `}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm">Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
