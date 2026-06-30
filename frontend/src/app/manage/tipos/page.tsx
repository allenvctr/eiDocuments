"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ManageLayout from '@/components/ui/ManageLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import TipoForm from '@/components/forms/TipoForm';
import TipoDetail from '@/components/details/TipoDetail';
import ModernButton from '@/components/ui/ModernButton';
import { Edit, Trash2, Eye, File, Plus } from 'lucide-react';
import { TipoDocumento } from '@/types';
import { useTipos } from '@/hooks/useTipos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useCategorias } from '@/hooks/useCategorias';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useAuth } from '@/hooks/useAuth';

const TiposPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { user, isAdmin: checkIsAdmin, loading: authLoading } = useAuth();
  const isAdmin = checkIsAdmin();

  const { carregarPaginado, carregarPorDepartamento, remover } = useTipos();
  const { categorias, carregar: carregarCategorias, carregarPorDepartamento: carregarCategoriasPorDep } = useCategorias();
  const { departamentos, carregar: carregarDepartamentos } = useDepartamentos();

  const fetchData = useCallback(async (params: any) => {
    const sanitized: Record<string, any> = {};
    const combined = { ...params, ...activeFilters };
    Object.entries(combined).forEach(([k, v]) => {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean' || v === undefined || v === null) {
        sanitized[k] = v;
      } else if (typeof v === 'object' && v !== null && 'value' in (v as any)) {
        sanitized[k] = (v as any).value;
      }
    });
    if (typeof sanitized.q === 'string') {
      const trimmed = sanitized.q.trim();
      if (trimmed) { sanitized.q = trimmed; } else { delete sanitized.q; }
    }

    const departamentoId = !isAdmin && user?.departamento?._id
      ? user.departamento._id
      : sanitized.departamento;

    if (departamentoId) {
      const { departamento, ...rest } = sanitized;
      return carregarPorDepartamento(departamentoId, rest);
    }
    return carregarPaginado(sanitized);
  }, [isAdmin, user?.departamento?._id, carregarPorDepartamento, carregarPaginado, activeFilters]);

  const {
    data: tipos,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({ fetchData, initialItemsPerPage: 10 });

  useEffect(() => {
    if (!user) return;
    if (isAdmin) {
      carregarCategorias();
      carregarDepartamentos();
    } else if (user?.departamento?._id) {
      carregarCategoriasPorDep(user.departamento._id, true);
    }
  }, [user?.departamento?._id, isAdmin]);

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

  const filteredCategorias = useMemo(() =>
    activeFilters.departamento
      ? categorias.filter(c => {
          const catDept = typeof c.departamento === 'string' ? c.departamento : c.departamento?._id;
          return catDept === activeFilters.departamento;
        })
      : categorias,
  [categorias, activeFilters.departamento]);

  const filterFields: SearchFilterField[] = useMemo(() => {
    const fields: SearchFilterField[] = [];
    if (isAdmin) {
      fields.push({ key: 'departamento', label: 'Departamento', type: 'select', dataSource: 'departamentos', placeholder: 'Todos os depts.' });
    }
    fields.push(
      { key: 'categoria', label: 'Categoria', type: 'select', dataSource: 'categorias', placeholder: 'Todas as categorias' },
      { key: 'ativo', label: 'Estado', type: 'select', placeholder: 'Todos', options: [{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }] },
    );
    return fields;
  }, [isAdmin]);

  const handleDelete = async (tipo: TipoDocumento) => {
    if (!confirm(`Deseja realmente excluir o tipo "${tipo.nome}"?`)) return;
    try {
      await remover(tipo._id);
      refetch();
    } catch (err) {
      console.error('Erro ao excluir tipo:', err);
    }
  };

  const handleAdd = () => { setSelectedTipo(null); setIsFormOpen(true); };
  const handleEdit = (t: TipoDocumento) => { setSelectedTipo(t); setIsFormOpen(true); };
  const handleView = (t: TipoDocumento) => { setSelectedTipo(t); setIsDetailOpen(true); };
  const handleFormSuccess = () => { refetch(); setIsFormOpen(false); setSelectedTipo(null); };
  const handleFormClose = () => { setIsFormOpen(false); setSelectedTipo(null); };
  const handleDetailClose = () => { setIsDetailOpen(false); setSelectedTipo(null); };

  const columns: TableColumn<TipoDocumento>[] = [
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
      maxWidth: '300px',
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <File className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
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
      key: 'categoria',
      title: 'Categoria',
      sortable: false,
      width: 'w-48',
      render: (_value, record) => {
        const categoria = typeof record.categoria === 'string' ? null : record.categoria;
        return categoria ? (
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: categoria.cor || '#6B7280' }} />
            <span className="text-sm text-gray-900 dark:text-gray-100 truncate">{categoria.nome}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400 dark:text-gray-500">-</span>
        );
      },
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

  const actions: TableAction<TipoDocumento>[] = [
    { key: 'view',   label: 'Visualizar', icon: <Eye className="w-4 h-4" />,    onClick: handleView },
    { key: 'edit',   label: 'Editar',     icon: <Edit className="w-4 h-4" />,   onClick: handleEdit },
    { key: 'delete', label: 'Excluir',    icon: <Trash2 className="w-4 h-4" />, onClick: handleDelete, variant: 'danger' },
  ];

  if (authLoading) {
    return (
      <ManageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Carregando...</p>
          </div>
        </div>
      </ManageLayout>
    );
  }

  return (
    <ManageLayout>
      <div>
        <SearchFilterBar
          title="Tipos de Documento"
          subtitle="Gerencie os tipos de documentos permitidos"
          actionButton={
            <ModernButton onClick={handleAdd} size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Novo Tipo
            </ModernButton>
          }
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Pesquisar tipos..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          departamentos={departamentos}
          categorias={filteredCategorias}
        />

        <DataTable
          data={tipos as TipoDocumento[]}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum tipo encontrado"
          onSort={handleSort}
          pagination={paginationProps}
        />

        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedTipo ? 'Editar Tipo' : 'Novo Tipo'}
        >
          <TipoForm tipo={selectedTipo} onSuccess={handleFormSuccess} />
        </FormModal>

        <TipoDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          tipo={selectedTipo}
        />
      </div>
    </ManageLayout>
  );
};

export default TiposPage;
