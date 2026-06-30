"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ManageLayout from '@/components/ui/ManageLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import CategoriaForm from '@/components/forms/CategoriaForm';
import CategoriaDetail from '@/components/details/CategoriaDetail';
import ModernButton from '@/components/ui/ModernButton';
import {
  FolderOpen, Edit, Trash2, Eye, Plus,
  FileText, Mail, BarChart3, Calculator, Receipt, FileCheck,
  Table2, Banknote, Scale, Tag, Folder, type LucideIcon,
} from 'lucide-react';

const ICONE_MAP: Record<string, LucideIcon> = {
  'file-contract':   FileText,
  'envelope':        Mail,
  'chart-bar':       BarChart3,
  'calculator':      Calculator,
  'receipt':         Receipt,
  'document-check':  FileCheck,
  'table':           Table2,
  'currency':        Banknote,
  'scale':           Scale,
  'tag':             Tag,
  'folder':          Folder,
};

function CategoriaIcone({ icone, cor }: { icone?: string; cor?: string }) {
  const Icon = icone ? (ICONE_MAP[icone] ?? FolderOpen) : null;
  const bg = cor ?? '#6b7280';
  if (!Icon) return (
    <div className="w-7 h-7 rounded-lg border border-gray-200 dark:border-gray-600 flex-shrink-0"
      style={{ backgroundColor: bg }} />
  );
  return (
    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: bg }}>
      <Icon className="w-4 h-4 text-white" />
    </div>
  );
}

import { CategoriaDocumento, CategoriaQueryParams } from '@/types';
import { CategoriasService } from '@/services/categoriasService';
import { useCategorias } from '@/hooks/useCategorias';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useAuth } from '@/hooks/useAuth';

const CategoriasPage = () => {
  const { user, isAdmin: checkIsAdmin } = useAuth();
  const isAdmin = checkIsAdmin();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<CategoriaDocumento | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { remover } = useCategorias();
  const { departamentos, carregar: carregarDepartamentos } = useDepartamentos();

  const departmentId = user?.role === 'editor' && user?.departamento
    ? (typeof user.departamento === 'string' ? user.departamento : user.departamento._id)
    : undefined;

  const fetchData = useCallback(async (params: {
    page?: number; limit?: number; q?: string;
  }) => {
    const queryParams: CategoriaQueryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.q?.trim() && { q: params.q.trim() }),
      ...(departmentId ? { departamento: departmentId } : activeFilters.departamento && { departamento: activeFilters.departamento }),
      ...(activeFilters.ativo !== undefined && activeFilters.ativo !== '' && { ativo: activeFilters.ativo === 'true' }),
    };
    const response = await CategoriasService.listar(queryParams);
    return {
      data: response.data,
      total: response.total || 0,
      page: response.page || 1,
      totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
    };
  }, [activeFilters, departmentId]);

  const {
    data: categorias,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({ fetchData, initialItemsPerPage: 10 });

  useEffect(() => {
    if (isAdmin) carregarDepartamentos();
  }, [isAdmin, carregarDepartamentos]);

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

  const filterFields: SearchFilterField[] = useMemo(() => {
    const fields: SearchFilterField[] = [];
    if (isAdmin) {
      fields.push({ key: 'departamento', label: 'Departamento', type: 'select', dataSource: 'departamentos', placeholder: 'Todos os depts.' });
    }
    fields.push({
      key: 'ativo', label: 'Estado', type: 'select', placeholder: 'Todos',
      options: [{ value: 'true', label: 'Ativo' }, { value: 'false', label: 'Inativo' }]
    });
    return fields;
  }, [isAdmin]);

  const handleDelete = async (categoria: CategoriaDocumento) => {
    if (!confirm(`Deseja realmente excluir a categoria "${categoria.nome}"?`)) return;
    try {
      await remover(categoria._id);
      refetch();
    } catch (err) {
      console.error('Erro ao excluir categoria:', err);
    }
  };

  const handleAdd = () => { setSelectedCategoria(null); setIsFormOpen(true); };
  const handleEdit = (c: CategoriaDocumento) => { setSelectedCategoria(c); setIsFormOpen(true); };
  const handleView = (c: CategoriaDocumento) => { setSelectedCategoria(c); setIsDetailOpen(true); };
  const handleFormSuccess = () => { refetch(); setIsFormOpen(false); setSelectedCategoria(null); };
  const handleFormClose = () => { setIsFormOpen(false); setSelectedCategoria(null); };
  const handleDetailClose = () => { setIsDetailOpen(false); setSelectedCategoria(null); };

  const columns: TableColumn<CategoriaDocumento>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: false,
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
      sortable: false,
      ellipsis: true,
      maxWidth: '350px',
      render: (value, record) => (
        <div className="flex items-center space-x-3">
          <CategoriaIcone icone={record.icone} cor={record.cor} />
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
    {
      key: 'dataCriacao',
      title: 'Data de Criação',
      sortable: false,
      width: 'w-32',
      render: (value) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(value).toLocaleDateString('pt-BR')}
        </span>
      ),
    },
  ];

  const actions: TableAction<CategoriaDocumento>[] = [
    { key: 'view',   label: 'Visualizar', icon: <Eye className="w-4 h-4" />,    onClick: handleView },
    { key: 'edit',   label: 'Editar',     icon: <Edit className="w-4 h-4" />,   onClick: handleEdit },
    { key: 'delete', label: 'Excluir',    icon: <Trash2 className="w-4 h-4" />, onClick: handleDelete, variant: 'danger' },
  ];

  return (
    <ManageLayout>
      <div>
        <SearchFilterBar
          title="Categorias"
          subtitle="Gerencie as categorias de documentos"
          actionButton={
            <ModernButton onClick={handleAdd} size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Nova Categoria
            </ModernButton>
          }
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchPlaceholder="Pesquisar categorias..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          departamentos={departamentos}
        />

        <DataTable
          data={categorias}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhuma categoria encontrada"
          onSort={handleSort}
          pagination={paginationProps}
        />

        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedCategoria ? 'Editar Categoria' : 'Nova Categoria'}
        >
          <CategoriaForm categoria={selectedCategoria} onSuccess={handleFormSuccess} />
        </FormModal>

        <CategoriaDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          categoria={selectedCategoria}
        />
      </div>
    </ManageLayout>
  );
};

export default CategoriasPage;
