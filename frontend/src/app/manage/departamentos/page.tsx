"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import ManageLayout from '@/components/ui/ManageLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import DepartamentoForm from '@/components/forms/DepartamentoForm';
import DepartamentoDetail from '@/components/details/DepartamentoDetail';
import ModernButton from '@/components/ui/ModernButton';
import { Building2, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { Departamento } from '@/types';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/hooks/useAuth';

const DepartamentosPage = () => {
  const router = useRouter();
  const { isAdmin: checkIsAdmin, canAccessAllDepartments, loading: authLoading } = useAuth();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedDepartamento, setSelectedDepartamento] = useState<Departamento | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!authLoading && !checkIsAdmin()) {
      router.push('/dashboard');
    }
  }, [authLoading, checkIsAdmin, router]);

  const { carregarPaginado, remover } = useDepartamentos();

  const fetchData = useCallback(async (params: {
    page?: number; limit?: number; q?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) => {
    const { q, ...rest } = params;
    return carregarPaginado({
      ...rest,
      ...(q?.trim() && { q: q.trim() }),
      ...(activeFilters.ativo !== undefined && activeFilters.ativo !== ''
        && { ativo: activeFilters.ativo === 'true' }),
    });
  }, [carregarPaginado, activeFilters]);

  const {
    data: departamentos,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({ fetchData, initialItemsPerPage: 10 });

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
      key: 'ativo', label: 'Estado', type: 'select', placeholder: 'Todos',
      options: [{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }]
    }
  ], []);

  const handleDelete = async (departamento: Departamento) => {
    if (!confirm(`Deseja realmente excluir o departamento "${departamento.nome}"?`)) return;
    try {
      await remover(departamento._id);
      refetch();
    } catch (err) {
      console.error('Erro ao excluir departamento:', err);
    }
  };

  const isAdmin = checkIsAdmin();

  const handleAdd = () => { setSelectedDepartamento(null); setIsFormOpen(true); };
  const handleEdit = (d: Departamento) => { setSelectedDepartamento(d); setIsFormOpen(true); };
  const handleView = (d: Departamento) => { setSelectedDepartamento(d); setIsDetailOpen(true); };
  const handleFormSuccess = () => { refetch(); setIsFormOpen(false); setSelectedDepartamento(null); };
  const handleFormClose = () => { setIsFormOpen(false); setSelectedDepartamento(null); };
  const handleDetailClose = () => { setIsDetailOpen(false); setSelectedDepartamento(null); };

  const columns: TableColumn<Departamento>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: 'w-24',
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-200 px-2 py-1 rounded">
          {value}
        </span>
      ),
    },
    {
      key: 'nome',
      title: 'Nome',
      sortable: true,
      ellipsis: true,
      maxWidth: '350px',
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <Building2 className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 dark:text-gray-400 overflow-hidden text-ellipsis whitespace-nowrap">
                {record.descricao}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      sortable: true,
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
  ];

  const actions: TableAction<Departamento>[] = [
    { key: 'view', label: 'Visualizar', icon: <Eye className="w-4 h-4" />, onClick: handleView },
    ...(isAdmin ? [
      { key: 'edit' as const,   label: 'Editar',  icon: <Edit className="w-4 h-4" />,   onClick: handleEdit },
      { key: 'delete' as const, label: 'Excluir', icon: <Trash2 className="w-4 h-4" />, onClick: handleDelete, variant: 'danger' as const },
    ] : [])
  ];

  return (
    <ManageLayout>
      <div>
        <SearchFilterBar
          title="Departamentos"
          subtitle="Gerencie os departamentos da organização"
          actionButton={
            isAdmin ? (
              <ModernButton onClick={handleAdd} size="sm" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                Novo Departamento
              </ModernButton>
            ) : undefined
          }
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Pesquisar departamentos..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
        />

        <DataTable
          data={departamentos}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum departamento encontrado"
          pagination={paginationProps}
          onSort={handleSort}
        />

        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedDepartamento ? 'Editar Departamento' : 'Novo Departamento'}
        >
          <DepartamentoForm departamento={selectedDepartamento} onSuccess={handleFormSuccess} />
        </FormModal>

        <DepartamentoDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          departamento={selectedDepartamento}
        />
      </div>
    </ManageLayout>
  );
};

export default DepartamentosPage;
