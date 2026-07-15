"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import ManageLayout from '@/components/ui/ManageLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import DocumentoForm from '@/components/forms/DocumentoForm';
import DocumentoDetail from '@/components/details/DocumentoDetail';
import ModernButton from '@/components/ui/ModernButton';
import { FileText, Edit, Trash2, Eye, Download, Building2, Plus } from 'lucide-react';

const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);

import { Documento } from '@/types';
import { DocumentosService } from '@/services/documentosService';
import type { DocumentoQueryParams } from '@/services/documentosService';
import { useDocumentos } from '@/hooks/useDocumentos';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useTipos } from '@/hooks/useTipos';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/hooks/useAuth';

const DocumentosPage = () => {
  const { user, isAdmin: checkIsAdmin, isEditor: checkIsEditor } = useAuth();
  const isAdmin = checkIsAdmin();
  const isEditor = checkIsEditor();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);

  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const { buscarPorId, remover, baixar } = useDocumentos();
  const { departamentos, carregar: carregarDepts } = useDepartamentos();
  const { categorias, carregar: carregarCats } = useCategorias();
  const { tipos, carregar: carregarTipos } = useTipos();
  const { usuarios, carregar: carregarUsuarios } = useUsuarios();

  // Load filter dropdown data on mount
  useEffect(() => {
    if (!user) return;
    carregarDepts({ limit: 100 });
    carregarCats({ limit: 100 });
    carregarTipos({ limit: 100 });
    // Load users filtered to the editor's department, or all for admin
    if (isEditor && user?.departamento?._id) {
      carregarUsuarios({ departamento: user.departamento._id, limit: 100 });
    } else if (isAdmin) {
      carregarUsuarios({ limit: 100 });
    }
  }, [isAdmin, isEditor, user?.departamento?._id, carregarDepts, carregarCats, carregarTipos, carregarUsuarios]);

  const fetchDocumentos = useCallback(async (params: {
    page?: number; limit?: number; q?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams: DocumentoQueryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.q?.trim() && { q: params.q.trim() }),
      ...(params.sortBy && { sortBy: params.sortBy, sortOrder: params.sortOrder || 'asc' }),
      ...(activeFilters.tipoMovimento && { tipoMovimento: activeFilters.tipoMovimento as 'enviado' | 'recebido' | 'interno' }),
      ...(activeFilters.status && { status: activeFilters.status as 'ativo' | 'arquivado' }),
      ...(activeFilters.departamento && { departamento: activeFilters.departamento }),
      ...(activeFilters.categoria && { categoria: activeFilters.categoria }),
      ...(activeFilters.tipo && { tipo: activeFilters.tipo }),
      ...(activeFilters.usuario && { usuario: activeFilters.usuario }),
      ...(activeFilters.dataEmissao_start && { dataEmissaoInicio: `${activeFilters.dataEmissao_start}T00:00:00.000Z` }),
      ...(activeFilters.dataEmissao_end && { dataEmissaoFim: `${activeFilters.dataEmissao_end}T23:59:59.999Z` }),
    };
    const response = await DocumentosService.listar(queryParams);
    return {
      data: response.data,
      total: response.total || 0,
      page: response.page || 1,
      totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
    };
  }, [activeFilters]);

  const {
    data: documentos,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({ fetchData: fetchDocumentos, initialItemsPerPage: 10 });

  const handleSearch = () => {
    setSearchQuery(searchValue);
  };

  const handleSearchChange = (v: string) => {
    setSearchValue(v);
    setSearchQuery(v); // live search
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value) {
        next[key] = value;
      } else {
        delete next[key];
      }
      // Cascata departamento -> categoria -> tipo: limpar filtros dependentes
      if (key === 'departamento') {
        delete next.categoria;
        delete next.tipo;
      } else if (key === 'categoria') {
        delete next.tipo;
      }
      return next;
    });
    goToPage(1);
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    goToPage(1);
  };

  // Cascata departamento -> categoria -> tipo nas opções dos filtros
  const categoriasFiltradas = useMemo(() => {
    if (!activeFilters.departamento) return categorias;
    return categorias.filter(c => {
      const depId = typeof c.departamento === 'object' ? c.departamento?._id : c.departamento;
      return depId === activeFilters.departamento;
    });
  }, [categorias, activeFilters.departamento]);

  const tiposFiltrados = useMemo(() => {
    const getCatId = (t: typeof tipos[number]) =>
      typeof t.categoria === 'object' ? t.categoria?._id : t.categoria;
    if (activeFilters.categoria) {
      return tipos.filter(t => getCatId(t) === activeFilters.categoria);
    }
    if (activeFilters.departamento) {
      const catIds = new Set(categoriasFiltradas.map(c => c._id));
      return tipos.filter(t => catIds.has(getCatId(t)));
    }
    return tipos;
  }, [tipos, categoriasFiltradas, activeFilters.categoria, activeFilters.departamento]);

  // Role-aware filter fields
  const filterFields: SearchFilterField[] = useMemo(() => {
    const fields: SearchFilterField[] = [];

    if (isAdmin) {
      fields.push({ key: 'departamento', label: 'Departamento', type: 'select', dataSource: 'departamentos', placeholder: 'Todos os depts.' });
    }

    if (isEditor) {
      fields.push({ key: 'usuario', label: 'Utilizador', type: 'select', dataSource: 'usuarios', placeholder: 'Todos os utilizadores' });
    }

    fields.push(
      { key: 'categoria', label: 'Categoria', type: 'select', dataSource: 'categorias', placeholder: 'Todas as categorias' },
      { key: 'tipo', label: 'Tipo', type: 'select', dataSource: 'tipos', placeholder: 'Todos os tipos' },
      {
        key: 'tipoMovimento', label: 'Movimento', type: 'select',
        options: [
          { value: 'enviado', label: 'Enviado' },
          { value: 'recebido', label: 'Recebido' },
          { value: 'interno', label: 'Interno' },
        ],
        placeholder: 'Todos'
      },
      { key: 'dataEmissao', label: 'Data de Emissão', type: 'daterange' },
    );

    if (isAdmin) {
      fields.push({
        key: 'status', label: 'Estado', type: 'select',
        options: [
          { value: 'ativo', label: 'Ativo' },
          { value: 'arquivado', label: 'Arquivado' },
        ],
        placeholder: 'Todos'
      });
    }

    return fields;
  }, [isAdmin, isEditor]);

  const handleDelete = async (documento: Documento) => {
    if (!confirm(`Deseja realmente excluir o documento "${documento.titulo}"?`)) return;
    try {
      await remover(documento._id);
      refetch();
    } catch (err) {
      console.error('Erro ao excluir documento:', err);
    }
  };

  const handleDownload = async (documento: Documento) => {
    try {
      await baixar(documento._id);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
    }
  };

  const handleAdd = () => {
    setSelectedDocumento(null);
    setIsFormOpen(true);
  };

  const handleEdit = async (documento: Documento) => {
    try {
      const documentoCompleto = await buscarPorId(documento._id);
      setSelectedDocumento(documentoCompleto);
      setIsFormOpen(true);
    } catch (error) {
      setSelectedDocumento(documento);
      setIsFormOpen(true);
    }
  };

  const handleView = async (documento: Documento) => {
    try {
      const documentoCompleto = await buscarPorId(documento._id);
      setSelectedDocumento(documentoCompleto);
      setIsDetailOpen(true);
    } catch (error) {
      setSelectedDocumento(documento);
      setIsDetailOpen(true);
    }
  };

  const handlePreview = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsPreviewOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const columns: TableColumn[] = [
    {
      key: 'titulo',
      title: 'Documento',
      sortable: true,
      wrap: true,
      maxWidth: '260px',
      render: (value, record) => (
        <div className="flex items-start gap-2">
          <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="font-medium text-gray-900 dark:text-gray-100 text-sm leading-tight break-words">{value}</div>
            {record.descricao && (
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{record.descricao}</div>
            )}
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 dark:text-gray-500">
              {record.departamento?.nome && (
                <>
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{record.departamento.nome}</span>
                  <span>·</span>
                </>
              )}
              <span className="truncate">{formatFileSize(record.arquivo?.size || 0)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoria',
      width: 'w-32',
      render: (value, record: any) => (
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: value?.cor || '#6B7280' }} />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{value?.nome}</span>
          </div>
          {record.tipo && typeof record.tipo === 'object' && record.tipo.nome && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-4 truncate">{record.tipo.nome}</div>
          )}
        </div>
      ),
    },
    {
      key: 'tipoMovimento',
      title: 'Movimento',
      sortable: false,
      width: 'w-32',
      render: (value, record: any) => {
        const movementConfig: Record<string, { bg: string; text: string; label: string }> = {
          recebido: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', label: 'Recebido' },
          enviado:  { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Enviado' },
          interno:  { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Interno' },
        };
        const config = movementConfig[value] || movementConfig.interno;
        const person =
          value === 'recebido' ? record.remetente :
          value === 'enviado'  ? record.destinatario :
          record.responsavel;

        return (
          <div className="space-y-0.5">
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            {person && (
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[112px]" title={person}>{person}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'dataCriacao',
      title: 'Data',
      sortable: true,
      width: 'w-24',
      render: (value, record: any) => (
        <div className="space-y-1">
          {record.dataEmissao && (
            <div>
              <div className="text-xs text-gray-400 dark:text-gray-500">Emissão</div>
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {new Date(record.dataEmissao).toLocaleDateString('pt-BR')}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs text-gray-400 dark:text-gray-500">Criação</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(value).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const actions: TableAction[] = [
    { key: 'preview',  label: 'Pré-visualizar', icon: <Eye className="w-4 h-4" />,    onClick: handlePreview },
    { key: 'download', label: 'Download',        icon: <Download className="w-4 h-4" />, onClick: handleDownload, variant: 'success' },
    { key: 'view',     label: 'Detalhes',        icon: <FileText className="w-4 h-4" />, onClick: handleView },
    { key: 'edit',     label: 'Editar',          icon: <Edit className="w-4 h-4" />,    onClick: handleEdit },
    { key: 'delete',   label: 'Excluir',         icon: <Trash2 className="w-4 h-4" />,  onClick: handleDelete, variant: 'danger' },
  ];

  return (
    <ManageLayout>
      <div>
        <SearchFilterBar
          title="Documentos"
          subtitle="Gerencie todos os documentos do sistema"
          actionButton={
            <ModernButton onClick={handleAdd} size="sm" className="flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              Novo Documento
            </ModernButton>
          }
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          searchPlaceholder="Pesquisar por título, descrição, remetente..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          departamentos={departamentos}
          categorias={categoriasFiltradas}
          tipos={tiposFiltrados}
          usuarios={usuarios}
        />

        <DataTable
          data={documentos as Documento[]}
          columns={columns}
          actions={actions}
          loading={loading}
          emptyMessage="Nenhum documento encontrado"
          pagination={paginationProps}
          onSort={handleSort}
        />

        <DocumentoForm
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setSelectedDocumento(null); }}
          onSuccess={refetch}
          documento={selectedDocumento}
        />

        <DocumentoDetail
          isOpen={isDetailOpen}
          onClose={() => { setIsDetailOpen(false); setSelectedDocumento(null); }}
          documento={selectedDocumento}
          onDownload={handleDownload}
        />

        {selectedDocumento && (
          <DocumentPreview
            isOpen={isPreviewOpen}
            onClose={() => { setIsPreviewOpen(false); setSelectedDocumento(null); }}
            documento={selectedDocumento}
            onDownload={() => handleDownload(selectedDocumento)}
          />
        )}
      </div>
    </ManageLayout>
  );
};

export default DocumentosPage;
