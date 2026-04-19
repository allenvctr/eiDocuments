"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ManageLayout from '@/components/ui/ManageLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import UsuarioForm from '@/components/forms/UsuarioForm';
import UsuarioDetail from '@/components/details/UsuarioDetail';
import { Users, Edit, Trash2, Eye, Shield, User, Building2 } from 'lucide-react';
import { Usuario } from '@/types';
import { useUsuarios } from '@/hooks/useUsuarios';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/hooks/useAuth';

const UsuariosPage = () => {
  const router = useRouter();
  const { canManageUsers, loading: authLoading } = useAuth();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  
  // Verificar permissões - apenas admin pode gerenciar usuários
  useEffect(() => {
    if (!authLoading && !canManageUsers()) {
      router.push('/dashboard');
    }
  }, [authLoading, canManageUsers, router]);
  
  const {
    carregarPaginado,
    remover
  } = useUsuarios();

  // Hook de paginação com dados da API
  const {
    data: usuarios,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch
  } = usePaginatedData({
    fetchData: carregarPaginado,
    initialItemsPerPage: 10
  });

  useEffect(() => {
    // O usePaginatedData já carrega os dados automaticamente
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleDelete = async (usuario: Usuario) => {
    if (!confirm(`Deseja realmente excluir o usuário "${usuario.nome}"?`)) {
      return;
    }

    try {
      await remover(usuario._id);
      refetch(); // Recarregar lista
    } catch (err) {
      // Erro já tratado pelo hook
      console.error('Erro ao excluir usuário:', err);
    }
  };

  const handleAdd = () => {
    setSelectedUsuario(null);
    setIsFormOpen(true);
  };

  const handleEdit = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsFormOpen(true);
  };

  const handleView = (usuario: Usuario) => {
    setSelectedUsuario(usuario);
    setIsDetailOpen(true);
  };

  const handleFormSuccess = () => {
    refetch(); // Recarregar lista após sucesso
    setIsFormOpen(false); // Fechar modal
    setSelectedUsuario(null); // Limpar seleção
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedUsuario(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedUsuario(null);
  };

  const getRoleBadge = (role: string) => {
    const roleMap: Record<string, { label: string; class: string; icon: React.ReactNode }> = {
      superadmin: {
        label: 'Super Admin',
        class: 'bg-purple-100 text-purple-800',
        icon: <Shield className="w-3 h-3" />
      },
      org_admin: {
        label: 'Org Admin',
        class: 'bg-orange-100 text-orange-800',
        icon: <Shield className="w-3 h-3" />
      },
      admin: {
        label: 'Administrador',
        class: 'bg-red-100 text-red-800',
        icon: <Shield className="w-3 h-3" />
      },
      editor: {
        label: 'Editor',
        class: 'bg-blue-100 text-blue-800',
        icon: <Users className="w-3 h-3" />
      },
      user: {
        label: 'Utilizador',
        class: 'bg-gray-100 text-gray-800',
        icon: <User className="w-3 h-3" />
      },
    };

    const roleInfo = roleMap[role] ?? roleMap.user;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${roleInfo.class}`}>
        {roleInfo.icon}
        <span className="ml-1">{roleInfo.label}</span>
      </span>
    );
  };

  const columns: TableColumn<Usuario>[] = [
    {
      key: 'nome',
      title: 'Usuário',
      sortable: true,
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            <div className="text-sm text-gray-500">@{record.username}</div>
            <div className="text-sm text-gray-500">{record.apelido}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'departamento',
      title: 'Departamento',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-sm">{typeof value === 'string' ? value : value?.nome || 'N/A'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      title: 'Função',
      sortable: true,
      width: 'w-40',
      render: (value) => getRoleBadge(value as string),
    },
    {
      key: 'dataCriacao',
      title: 'Data de Criação',
      sortable: true,
      width: 'w-32',
      render: (value) => (
        <span className="text-sm text-gray-600">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      sortable: true,
      width: 'w-20',
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const actions: TableAction<Usuario>[] = [
    {
      key: 'view',
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleView,
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: handleEdit,
      // Só admin pode editar usuários
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
      // Só admin pode deletar usuários
    },
  ];

  return (
    <ManageLayout>
      <div>
        <PageHeader
          title="Usuários"
          subtitle="Gerencie os usuários do sistema"
          onAdd={handleAdd}
          onSearch={handleSearch}
          onFilter={() => console.log('Filtrar usuários')}
          onExport={() => console.log('Exportar usuários')}
          addButtonText="Novo Usuário"
          searchPlaceholder="Pesquisar usuários..."
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

        {/* Formulário Modal */}
        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedUsuario ? 'Editar Usuário' : 'Novo Usuário'}
        >
          <UsuarioForm
            usuario={selectedUsuario}
            onSuccess={handleFormSuccess}
          />
        </FormModal>

        {/* Modal de Detalhes */}
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
