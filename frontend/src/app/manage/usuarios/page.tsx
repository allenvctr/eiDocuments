"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ManageLayout from '@/components/ui/ManageLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import UsuarioForm from '@/components/forms/UsuarioForm';
import UsuarioDetail from '@/components/details/UsuarioDetail';
import ModernButton from '@/components/ui/ModernButton';
import { Users, Edit, Trash2, Eye, Shield, User, Building2, Plus } from 'lucide-react';
import { Usuario, UsuarioQueryParams, UserRole } from '@/types';
import { UsuariosService } from '@/services/usuariosService';
import { useUsuarios } from '@/hooks/useUsuarios';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/hooks/useAuth';

const UsuariosPage = () => {
  const router = useRouter();
  const { canManageUsers, loading: authLoading, user } = useAuth();
  const ROLE_LEVEL: Record<string, number> = { superadmin: 4, org_admin: 3, admin: 2, editor: 1, user: 0 };

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !canManageUsers()) {
      router.push('/dashboard');
    }
  }, [authLoading, canManageUsers, router]);

  const { remover } = useUsuarios();

  const fetchUsuarios = useCallback(async (params: {
    page?: number; limit?: number; q?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams: UsuarioQueryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.q?.trim() && { q: params.q.trim() }),
      ...(params.sortBy && { sortBy: params.sortBy, sortOrder: params.sortOrder || 'asc' }),
      ...(activeFilters.role && { role: activeFilters.role as UserRole }),
      ...(activeFilters.ativo !== undefined && activeFilters.ativo !== '' && { ativo: activeFilters.ativo === 'true' }),
    };
    const response = await UsuariosService.listar(queryParams);
    return {
      data: response.data,
      total: response.total || 0,
      page: response.page || 1,
      totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
    };
  }, [activeFilters]);

  const {
    data: usuarios,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({ fetchData: fetchUsuarios, initialItemsPerPage: 10 });

  const handleSearchChange = (v: string) => {
    setSearchValue(v);
    setSearchQuery(v);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value) { next[key] = value; } else { delete next[key]; }
      return next;
    });
    goToPage(1);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    goToPage(1);
  };

  const filterFields: SearchFilterField[] = useMemo(() => [
    {
      key: 'role', label: 'Função', type: 'select', placeholder: 'Todas as funções',
      options: [
        { value: 'org_admin', label: 'Adm. da Empresa' },
        { value: 'admin',     label: 'Administrador' },
        { value: 'editor',    label: 'Editor' },
        { value: 'user',      label: 'Utilizador' },
      ]
    },
    {
      key: 'ativo', label: 'Estado', type: 'select', placeholder: 'Todos os estados',
      options: [
        { value: 'true',  label: 'Ativo' },
        { value: 'false', label: 'Inativo' },
      ]
    },
  ], []);

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`Deseja realmente excluir o usuário "${usuario.nome}"?`)) return;
    try {
      await remover(usuario._id);
      refetch();
    } catch (err) {
      console.error('Erro ao excluir usuário:', err);
    }
  };

  const handleAdd = () => { setSelectedUsuario(null); setIsFormOpen(true); };
  const handleEdit = (u: Usuario) => { setSelectedUsuario(u); setIsFormOpen(true); };
  const handleView = (u: Usuario) => { setSelectedUsuario(u); setIsDetailOpen(true); };
  const handleFormSuccess = () => { refetch(); setIsFormOpen(false); setSelectedUsuario(null); };
  const handleFormClose = () => { setIsFormOpen(false); setSelectedUsuario(null); };
  const handleDetailClose = () => { setIsDetailOpen(false); setSelectedUsuario(null); };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
      org_admin: { label: 'Adm. da Empresa',  class: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300', icon: <Shield className="w-3 h-3" /> },
      admin:     { label: 'Administrador',     class: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',             icon: <Shield className="w-3 h-3" /> },
      editor:    { label: 'Editor (Gerente)',  class: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',     icon: <Users className="w-3 h-3" /> },
      user:      { label: 'Utilizador',        class: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300',            icon: <User className="w-3 h-3" /> },
    };
    const info = roleMap[role] ?? roleMap.user;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${info.class}`}>
        {info.icon}
        <span className="ml-1">{info.label}</span>
      </span>
    );
  };

  const columns: TableColumn<Usuario>[] = [
    {
      key: 'nome',
      title: 'Usuário',
      sortable: true,
      ellipsis: true,
      maxWidth: '300px',
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{value}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">@{record.username}</div>
            {record.apelido && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{record.apelido}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'departamento',
      title: 'Departamento',
      sortable: false,
      width: 'w-32',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <div className="font-medium text-sm">{typeof value === 'string' ? value : value?.nome || 'N/A'}</div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Função',
      sortable: false,
      width: 'w-40',
      render: (value) => getRoleBadge(value as string),
    },
    {
      key: 'dataCriacao',
      title: 'Data de Criação',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      sortable: false,
      width: 'w-20',
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value
            ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
            : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
        }`}>
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const actions: TableAction<Usuario>[] = [
    { key: 'view', label: 'Visualizar', icon: <Eye className="w-4 h-4" />, onClick: handleView },
    {
      key: 'edit', label: 'Editar', icon: <Edit className="w-4 h-4" />, onClick: handleEdit,
      hidden: (u: Usuario) => (ROLE_LEVEL[u.role] ?? 0) >= (ROLE_LEVEL[user?.role ?? 'user'] ?? 0),
    },
    {
      key: 'delete', label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: handleDelete, variant: 'danger',
      hidden: (u: Usuario) => (ROLE_LEVEL[u.role] ?? 0) >= (ROLE_LEVEL[user?.role ?? 'user'] ?? 0),
    },
  ];

  return (
    <ManageLayout>
      <div>
        <SearchFilterBar
          title="Usuários"
          subtitle="Gerencie os usuários do sistema"
          actionButton={
            <ModernButton onClick={handleAdd} size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Novo Usuário
            </ModernButton>
          }
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Pesquisar usuários..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <DataTable
          data={usuarios as Usuario[]}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum usuário encontrado"
          pagination={paginationProps}
          onSort={handleSort}
        />

        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}
        >
          <UsuarioForm usuario={selectedUsuario} onSuccess={handleFormSuccess} />
        </FormModal>

        <UsuarioDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          usuario={selectedUsuario}
        />
      </div>
    </ManageLayout>
  );
};

export default UsuariosPage;
