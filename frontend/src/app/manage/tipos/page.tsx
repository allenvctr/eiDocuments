"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import ManageLayout from '@/components/ui/ManageLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FormModal from '@/components/ui/FormModal';
import FilterPanel, { FilterField } from '@/components/ui/FilterPanel';
import TipoForm from '@/components/forms/TipoForm';
import TipoDetail from '@/components/details/TipoDetail';
import { Edit, Trash2, Eye, File } from 'lucide-react';
import { TipoDocumento } from '@/types';
import { useTipos } from '@/hooks/useTipos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useCategorias } from '@/hooks/useCategorias';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useAuth } from '@/hooks/useAuth';

const TiposPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoDocumento | null>(null);
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  
  const { user, isAdmin, loading: authLoading } = useAuth();
  const {
    carregarPaginado,
    carregarPorDepartamento,
    remover
  } = useTipos();

  const { categorias, carregar: carregarCategorias, carregarPorDepartamento: carregarCategoriasPorDep } = useCategorias();
  const { departamentos, carregar: carregarDepartamentos } = useDepartamentos();
  const [categoriasLoaded, setCategoriasLoaded] = useState(false);
  const [departamentosLoaded, setDepartamentosLoaded] = useState(false);

  // Não renderizar até que o usuário esteja carregado
  if (authLoading) {
    return (
      <ManageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando...</p>
          </div>
        </div>
      </ManageLayout>
    );
  }

  // Memorizar a função fetchData para evitar re-renderizações
  const fetchData = useCallback(async (params: any) => {
    // Combinar params com filtros ativos
    const combinedParams = {
      ...params,
      ...activeFilters
    };

    // Sanitizar: garantir que todos os valores são primitivos e não vazios
    const sanitizedParams: Record<string, any> = {};
    Object.entries(combinedParams).forEach(([key, value]) => {
      // Pular valores vazios
      if (value === '' || value === null || value === undefined) {
        return;
      }
      
      if (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'boolean'
      ) {
        sanitizedParams[key] = value;
      } else if (typeof value === 'object' && value !== null && 'value' in value) {
        // Caso venha de select customizado (ex: { value: 'abc', label: 'Nome' })
        if (value.value !== '' && value.value !== null && value.value !== undefined) {
          sanitizedParams[key] = value.value;
        }
      }
      // Ignora outros tipos
    });

    console.log('🔍 Tipos fetchData - sanitizedParams:', sanitizedParams);

    // Se for editor OU se admin filtrou por departamento específico, usar endpoint de departamento
    const departamentoId = !isAdmin() && user?.departamento?._id
      ? user.departamento!._id
      : sanitizedParams.departamento;

    if (departamentoId) {
      // Remover departamento dos params já que vai na URL
      const { departamento, ...restParams } = sanitizedParams;
      console.log('🔍 Tipos - Carregando por departamento:', departamentoId, 'com params:', restParams);
      return carregarPorDepartamento(departamentoId, restParams);
    }

    // Admin sem filtro de departamento - vê todos
    console.log('🔍 Tipos - Carregando todos com params:', sanitizedParams);
    return carregarPaginado(sanitizedParams);
  }, [isAdmin, user?.departamento?._id, carregarPorDepartamento, carregarPaginado, activeFilters]);

  // Hook de paginação com dados da API
  const {
    data: tipos,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch
  } = usePaginatedData({
    fetchData,
    initialItemsPerPage: 10
  });

  useEffect(() => {
    // Carregar categorias apenas uma vez baseado no role
    if (categoriasLoaded || !user) return;
    
    const loadCategorias = async () => {
      try {
        if (isAdmin()) {
          // Admin não carrega todas as categorias - apenas quando selecionar departamento
          setCategoriasLoaded(true);
        } else if (user?.departamento?._id) {
          // Editor carrega categorias do seu departamento
          await carregarCategoriasPorDep(user.departamento!._id, true);
          setCategoriasLoaded(true);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      }
    };
    
    loadCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.departamento?._id]);

  // Carregar categorias quando admin seleciona departamento
  useEffect(() => {
    if (!isAdmin() || !activeFilters.departamento) return;
    
    const loadCategoriasPorDept = async () => {
      try {
        await carregarCategoriasPorDep(activeFilters.departamento, true);
      } catch (error) {
        console.error('Erro ao carregar categorias do departamento:', error);
      }
    };
    
    loadCategoriasPorDept();
  }, [activeFilters.departamento, isAdmin, carregarCategoriasPorDep]);

  useEffect(() => {
    // Carregar departamentos para admin
    if (departamentosLoaded || !isAdmin() || !user) return;
    
    const loadDepartamentos = async () => {
      try {
        await carregarDepartamentos();
        setDepartamentosLoaded(true);
      } catch (error) {
        console.error('Erro ao carregar departamentos:', error);
      }
    };
    
    loadDepartamentos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Configuração dos filtros
  const filterFields: FilterField[] = isAdmin() ? [
    {
      id: 'departamento',
      label: 'Departamento',
      type: 'select',
      placeholder: 'Selecione um departamento',
      options: departamentos.map(dept => ({
        id: dept._id,
        label: dept.nome,
        value: dept._id
      }))
    },
    {
      id: 'categoria',
      label: 'Categoria',
      type: 'select',
      placeholder: activeFilters.departamento ? 'Todas as categorias' : 'Selecione um departamento primeiro',
      options: categorias.map(cat => ({
        id: cat._id,
        label: cat.nome,
        value: cat._id
      })),
      disabled: !activeFilters.departamento // Desabilitar até selecionar departamento
    },
    {
      id: 'ativo',
      label: 'Status',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { id: 'true', label: 'Ativos', value: 'true' },
        { id: 'false', label: 'Inativos', value: 'false' }
      ]
    }
  ] : [
    {
      id: 'categoria',
      label: 'Categoria',
      type: 'select',
      placeholder: 'Todas as categorias',
      options: categorias.map(cat => ({
        id: cat._id,
        label: cat.nome,
        value: cat._id
      }))
    },
    {
      id: 'ativo',
      label: 'Status',
      type: 'select',
      placeholder: 'Todos',
      options: [
        { id: 'true', label: 'Ativos', value: 'true' },
        { id: 'false', label: 'Inativos', value: 'false' }
      ]
    }
  ];

  const handleApplyFilters = (filters: Record<string, any>) => {
    console.log('📋 Filtros aplicados:', filters);
    
    // Se admin limpou o filtro de departamento, limpar também categoria
    if (isAdmin() && !filters.departamento && activeFilters.departamento) {
      const { categoria, ...restFilters } = filters;
      setActiveFilters(restFilters);
    } else {
      setActiveFilters(filters);
    }
    // O refetch será disparado automaticamente pelo useEffect do usePaginatedData
    // quando activeFilters mudar (porque fetchData depende de activeFilters)
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    // O refetch será disparado automaticamente
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const handleDelete = async (tipo: TipoDocumento) => {
    if (!confirm(`Deseja realmente excluir o tipo "${tipo.nome}"?`)) {
      return;
    }

    try {
      await remover(tipo._id);
      refetch(); // Recarregar lista
    } catch (err) {
      // Erro já tratado pelo hook
      console.error('Erro ao excluir tipo:', err);
    }
  };

  const handleAdd = () => {
    setSelectedTipo(null);
    setIsFormOpen(true);
  };

  const handleEdit = (tipo: TipoDocumento) => {
    setSelectedTipo(tipo);
    setIsFormOpen(true);
  };

  const handleView = (tipo: TipoDocumento) => {
    setSelectedTipo(tipo);
    setIsDetailOpen(true);
  };

  const handleFormSuccess = () => {
    refetch(); // Recarregar lista após sucesso
    setIsFormOpen(false); // Fechar modal
    setSelectedTipo(null); // Limpar seleção
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedTipo(null);
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedTipo(null);
  };

  const columns: TableColumn<TipoDocumento>[] = [
    {
      key: 'codigo',
      title: 'Código',
      sortable: true,
      width: 'w-24',
      render: (value) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
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
          <div className="flex-shrink-0">
            <File className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 overflow-hidden text-ellipsis whitespace-nowrap">
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
      render: (value, record) => {
        const categoria = typeof record.categoria === 'string' 
          ? null 
          : record.categoria;
        
        return categoria ? (
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full flex-shrink-0" 
              style={{ backgroundColor: categoria.cor || '#6B7280' }}
            />
            <span className="text-sm text-gray-900 truncate">
              {categoria.nome}
            </span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      },
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
  ];

  const actions: TableAction<TipoDocumento>[] = [
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
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: handleDelete,
      variant: 'danger',
    },
  ];

  return (
    <ManageLayout>
      <div>
        <PageHeader
          title="Tipos de Documento"
          subtitle="Gerencie os tipos de documentos permitidos"
          onAdd={handleAdd}
          onSearch={handleSearch}
          onFilter={() => setIsFilterOpen(true)}
          addButtonText="Novo Tipo"
          searchPlaceholder="Pesquisar tipos..."
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

        {/* Painel de Filtros */}
        <FilterPanel
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          fields={filterFields}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          initialValues={activeFilters}
        />

        {/* Formulário Modal */}
        <FormModal
          isOpen={isFormOpen}
          onClose={handleFormClose}
          title={selectedTipo ? 'Editar Tipo' : 'Novo Tipo'}
        >
          <TipoForm
            tipo={selectedTipo}
            onSuccess={handleFormSuccess}
          />
        </FormModal>

        {/* Modal de Detalhes */}
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
