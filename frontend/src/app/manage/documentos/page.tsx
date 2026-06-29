"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import ManageLayout from '@/components/ui/ManageLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import FilterPanel, { FilterField } from '@/components/ui/FilterPanel';
import DocumentoForm from '@/components/forms/DocumentoForm';
import DocumentoDetail from '@/components/details/DocumentoDetail';
import { FileText, Edit, Trash2, Eye, Download, Building2, FolderOpen } from 'lucide-react';

// Dynamic import to avoid SSR issues with react-pdf
const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);
import { Documento } from '@/types';
import { DocumentosService } from '@/services/documentosService';
import type { DocumentoQueryParams } from '@/services/documentosService';
import { useDocumentos } from '@/hooks/useDocumentos';
import { usePaginatedData } from '@/hooks/usePaginatedData';

const DocumentosPage = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const {
    buscarPorId,
    remover,
    baixar
  } = useDocumentos();

  const fetchDocumentos = useCallback(async (params: {
    page?: number; limit?: number; q?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) => {
    const queryParams: DocumentoQueryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      ...(params.q && { q: params.q }),
      ...(params.sortBy && { sortBy: params.sortBy, sortOrder: params.sortOrder || 'asc' }),
      ...(activeFilters.tipoMovimento && { tipoMovimento: activeFilters.tipoMovimento as 'enviado' | 'recebido' | 'interno' }),
      ...(activeFilters.status && { status: activeFilters.status as 'ativo' | 'arquivado' }),
      ...(activeFilters.dataCriacao_start && { dataInicio: `${activeFilters.dataCriacao_start}T00:00:00.000Z` }),
      ...(activeFilters.dataCriacao_end && { dataFim: `${activeFilters.dataCriacao_end}T23:59:59.999Z` }),
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

  // Hook de paginação com dados da API
  const {
    data: documentos,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({
    fetchData: fetchDocumentos,
    initialItemsPerPage: 10
  });

  useEffect(() => {
    // O usePaginatedData já carrega os dados automaticamente
  }, []);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
  };

  const filterFields: FilterField[] = [
    {
      id: 'tipoMovimento',
      label: 'Tipo de Movimento',
      type: 'select',
      placeholder: 'Todos os tipos',
      options: [
        { id: 'enviado',  label: 'Enviado',  value: 'enviado' },
        { id: 'recebido', label: 'Recebido', value: 'recebido' },
        { id: 'interno',  label: 'Interno',  value: 'interno' },
      ]
    },
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      placeholder: 'Todos os estados',
      options: [
        { id: 'ativo',      label: 'Ativo',      value: 'ativo' },
        { id: 'arquivado',  label: 'Arquivado',   value: 'arquivado' },
      ]
    },
    {
      id: 'dataCriacao',
      label: 'Período de Criação',
      type: 'daterange',
    },
    {
      id: 'dataEmissao',
      label: 'Período de Emissão',
      type: 'daterange',
    }
  ];

  const handleFilterApply = (filters: Record<string, string>) => {
    setActiveFilters(filters);
    goToPage(1);
  };

  const handleFilterClear = () => {
    setActiveFilters({});
    goToPage(1);
  };

  const handleDelete = async (documento: Documento) => {
    if (!confirm(`Deseja realmente excluir o documento "${documento.titulo}"?`)) {
      return;
    }

    try {
      await remover(documento._id);
      refetch(); // Recarregar lista
    } catch (err) {
      // Erro já tratado pelo hook
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
      // Buscar documento completo com populate
      const documentoCompleto = await buscarPorId(documento._id);
      setSelectedDocumento(documentoCompleto);
      setIsFormOpen(true);
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      // Fallback: usar dados da lista
      setSelectedDocumento(documento);
      setIsFormOpen(true);
    }
  };

  const handleFormSuccess = () => {
    refetch(); // Recarregar lista após sucesso
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedDocumento(null);
  };

  const handleView = async (documento: Documento) => {
    try {
      // Buscar documento completo com populate para visualização
      const documentoCompleto = await buscarPorId(documento._id);
      setSelectedDocumento(documentoCompleto);
      setIsDetailOpen(true);
    } catch (error) {
      console.error('Erro ao buscar documento:', error);
      // Fallback: usar dados da lista
      setSelectedDocumento(documento);
      setIsDetailOpen(true);
    }
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setSelectedDocumento(null);
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
      maxWidth: '350px',
      render: (value, record) => (
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 break-words">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{record.descricao}</div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">
              {record.arquivo.originalName} • {formatFileSize(record.arquivo.size)}
            </div>
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
          <div>
            <div className="font-medium text-sm">{value.nome}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{value.codigo}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoria / Tipo',
      width: 'w-36',
      render: (value, record: any) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: value.cor || '#6B7280' }}></div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{value.nome}</span>
          </div>
          {record.tipo && typeof record.tipo === 'object' && record.tipo.nome && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-5">{record.tipo.nome}</div>
          )}
        </div>
      ),
    },
    {
      key: 'tipoMovimento',
      title: 'Movimento/Responsável',
      sortable: false,
      width: 'w-40',
      render: (value, record: any) => {
        const movementConfig: Record<string, { bg: string; text: string; label: string }> = {
          'recebido': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Recebido' },
          'enviado': { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Enviado' },
          'interno': { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Interno' }
        };
        
        const config = movementConfig[value] || movementConfig.interno;
        
        let person = '';
        let personLabel = '';
        
        if (value === 'recebido' && record.remetente) {
          person = record.remetente;
          personLabel = 'De:';
        } else if (value === 'enviado' && record.destinatario) {
          person = record.destinatario;
          personLabel = 'Para:';
        } else if (value === 'interno' && record.responsavel) {
          person = record.responsavel;
          personLabel = 'Resp:';
        }
        
        return (
          <div className="space-y-1">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
              {config.label}
            </span>
            {person && (
              <div className="text-sm">
                <div className="text-xs text-gray-500 dark:text-gray-400">{personLabel}</div>
                <div className="text-gray-900 dark:text-gray-100 font-medium truncate">{person}</div>
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: 'dataCriacao',
      title: 'Datas',
      sortable: true,
      width: 'w-28',
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
            <div className={`text-sm ${record.dataEmissao ? 'text-gray-500 dark:text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
              {new Date(value).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'ativo',
      title: 'Status',
      width: 'w-20',
      render: (value) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
            value
              ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300'
              : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'
          }`}
        >
          {value ? 'Ativo' : 'Inativo'}
        </span>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      key: 'preview',
      label: 'Pré-visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: handlePreview,
    },
    {
      key: 'download',
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: handleDownload,
      variant: 'success',
    },
    {
      key: 'view',
      label: 'Detalhes',
      icon: <FileText className="w-4 h-4" />,
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
          title="Documentos"
          subtitle="Gerencie todos os documentos do sistema"
          onAdd={handleAdd}
          onSearch={handleSearch}
          onFilter={() => setShowFilter(true)}
          addButtonText="Novo Documento"
          searchPlaceholder="Pesquisar documentos..."
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
          onClose={handleFormClose}
          onSuccess={handleFormSuccess}
          documento={selectedDocumento}
        />

        {/* Modal de Detalhes */}
        <DocumentoDetail
          isOpen={isDetailOpen}
          onClose={handleDetailClose}
          documento={selectedDocumento}
          onDownload={handleDownload}
        />

        {/* Modal de Preview */}
        {selectedDocumento && (
          <DocumentPreview
            isOpen={isPreviewOpen}
            onClose={() => {
              setIsPreviewOpen(false);
              setSelectedDocumento(null);
            }}
            documento={selectedDocumento}
            onDownload={() => handleDownload(selectedDocumento)}
          />
        )}

        <FilterPanel
          isOpen={showFilter}
          onClose={() => setShowFilter(false)}
          fields={filterFields}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
          initialValues={activeFilters}
        />
      </div>
    </ManageLayout>
  );
};

export default DocumentosPage;
