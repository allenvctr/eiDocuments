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
  Settings,
  Users,
  BarChart3
} from 'lucide-react';

interface AdminSidebarProps {
  className?: string;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ className = '' }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isAdminRole = user?.role === 'superadmin' || user?.role === 'org_admin' || user?.role === 'admin';

  // Determinar URL do dashboard baseado no role
  const dashboardHref = isAdminRole ? '/dashboard/admin' : '/dashboard/editor';

  // Itens de menu base (Dashboard)
  const baseMenuItems = [
    {
      title: isAdminRole ? 'Dashboard Admin' : 'Dashboard Editor',
      icon: Home,
      href: dashboardHref,
      description: 'Visão geral do sistema'
    }
  ];

  // Itens comuns para Editor e Admin
  const managerMenuItems = [
    {
      title: 'Gerenciar Documentos',
      icon: FileText,
      href: '/manage/documentos',
      description: 'Gerenciar documentos'
    },
    {
      title: 'Categorias',
      icon: FolderOpen,
      href: '/manage/categorias',
      description: 'Gerenciar categorias'
    },
    {
      title: 'Tipos de Documento',
      icon: FileType,
      href: '/manage/tipos',
      description: 'Gerenciar tipos de documento'
    }
  ];

  // Itens exclusivos de Admin (Usuários e Departamentos)
  const adminOnlyMenuItems = [
    {
      title: 'Gerenciar Usuários',
      icon: Users,
      href: '/manage/usuarios',
      description: 'Gerenciar usuários do sistema'
    },
    {
      title: 'Departamentos',
      icon: Building2,
      href: '/manage/departamentos',
      description: 'Gerenciar departamentos'
    }
  ];

  // Item de Relatórios
  // const reportsMenuItem = {
  //   title: 'Relatórios',
  //   icon: BarChart3,
  //   href: '/manage/relatorios',
  //   description: 'Relatórios do sistema'
  // };

  // Montar menu baseado no role do usuário
  let menuItems = baseMenuItems;

  if (isAdminRole) {
    menuItems = [...baseMenuItems, ...managerMenuItems, ...adminOnlyMenuItems];
  } else if (user?.role === 'editor') {
    menuItems = [...baseMenuItems, ...managerMenuItems];
  }

  const isActive = (href: string) => {
    if (href === '/dashboard/admin' || href === '/dashboard/editor') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className={`
      ${isCollapsed ? 'w-16' : 'w-64'} 
      h-screen bg-white border-r border-gray-200 
      transition-all duration-300 ease-in-out
      flex flex-col
      ${className}
    `}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.jpg" 
              alt="Contratuz Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
            <span className="text-xl font-bold text-gray-800">Admin Panel</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <img 
              src="/logo.jpg" 
              alt="Contratuz Logo" 
              className="w-8 h-8 rounded-lg object-cover"
            />
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex items-center space-x-3 p-3 rounded-lg transition-colors
                ${active 
                  ? 'bg-red-100 text-red-700 border border-red-200' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && (
                <>
                  <div className="flex-1">
                    <div className="font-medium">{item.title}</div>
                    <div className="text-xs text-gray-400">{item.description}</div>
                  </div>
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        {/* User Info */}
        {!isCollapsed && user && (
          <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg mb-2">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-medium text-white">
                {user.nome?.charAt(0) || user.username?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {user.nome || user.username}
              </div>
              <div className="text-xs text-red-500 font-medium">
                {user.role === 'superadmin' && 'Super Admin'}
                {user.role === 'org_admin' && 'Org Admin'}
                {user.role === 'admin' && 'Administrador'}
                {user.role === 'editor' && 'Gerente'}
                {user.role === 'user' && 'Utilizador'}
              </div>
            </div>
          </div>
        )}
        
        {/* <Link
          href="/settings"
          className="flex items-center space-x-3 p-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span>Configurações</span>}
        </Link> */}
        
        <button 
          onClick={logout}
          className="w-full flex items-center space-x-3 p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span>Sair</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
