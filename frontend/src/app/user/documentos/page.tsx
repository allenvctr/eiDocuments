"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import UserLayout from '@/components/ui/UserLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn } from '@/components/ui/DataTable';
import { FileText, Eye, Download, Edit, Calendar } from 'lucide-react';
import { Documento } from '@/types';
import { DocumentosService } from '@/services/documentosService';
import type { DocumentoQueryParams } from '@/services/documentosService';
import { usePaginatedData } from '@/hooks/usePaginatedData';
import { useCategorias } from '@/hooks/useCategorias';
import { useTipos } from '@/hooks/useTipos';
import { useAuth } from '@/hooks/useAuth';
import { useDocumentos } from '@/hooks/useDocumentos';
import DocumentoViewModal from '@/components/details/DocumentoViewModal';
import DocumentoEditModal from '@/components/forms/DocumentoEditModal';

const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);

const DocumentosDepartamentoPage = () => {
  const { user } = useAuth();
  const { baixar } = useDocumentos();

  const [searchValue, setSearchValue] = useState('');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const deptId = user?.departamento?._id;

  const { categorias, carregarPorDepartamento } = useCategorias();
  const { tipos, carregar: carregarTipos } = useTipos();

  useEffect(() => {
    if (deptId) {
      carregarPorDepartamento(deptId, true);
      carregarTipos({ limit: 100 });
    }
  }, [deptId, carregarPorDepartamento, carregarTipos]);

  const fetchDocumentos = useCallback(async (params: {
    page?: number; limit?: number; q?: string; sortBy?: string; sortOrder?: 'asc' | 'desc';
  }) => {
    if (!deptId) return { data: [], total: 0, page: 1, totalPages: 0 };

    const queryParams: DocumentoQueryParams = {
      page: params.page || 1,
      limit: params.limit || 10,
      departamento: deptId,
      ...(params.q?.trim() && { q: params.q.trim() }),
      ...(params.sortBy && { sortBy: params.sortBy, sortOrder: params.sortOrder || 'asc' }),
      ...(activeFilters.categoria && { categoria: activeFilters.categoria }),
      ...(activeFilters.tipo && { tipo: activeFilters.tipo }),
      ...(activeFilters.tipoMovimento && { tipoMovimento: activeFilters.tipoMovimento as 'enviado' | 'recebido' | 'interno' }),
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
  }, [deptId, activeFilters]);

  const {
    data: documentos,
    loading,
    setSearchQuery,
    handleSort,
    paginationProps,
    refetch,
    goToPage
  } = usePaginatedData({ fetchData: fetchDocumentos, initialItemsPerPage: 10 });

  const handleSearchChange = (v: string) => {
    setSearchValue(v);
    setSearchQuery(v); // live search
  };

  const handleSearch = () => {
    setSearchQuery(searchValue);
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value) { next[key] = value; } else { delete next[key]; }
      // Cascata categoria -> tipo: limpar tipo ao mudar a categoria
      if (key === 'categoria') delete next.tipo;
      return next;
    });
    goToPage(1);
  };

  // Cascata categoria -> tipo nas opções dos filtros
  const tiposFiltrados = useMemo(() => {
    const getCatId = (t: typeof tipos[number]) =>
      typeof t.categoria === 'object' ? t.categoria?._id : t.categoria;
    if (activeFilters.categoria) {
      return tipos.filter(t => getCatId(t) === activeFilters.categoria);
    }
    if (!categorias.length) return tipos;
    const catIds = new Set(categorias.map(c => c._id));
    return tipos.filter(t => catIds.has(getCatId(t)));
  }, [tipos, categorias, activeFilters.categoria]);

  const handleClearFilters = () => {
    setActiveFilters({});
    goToPage(1);
  };

  const handleDownload = async (documento: Documento) => {
    try {
      await baixar(documento._id);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
    }
  };

  const handleView = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsViewModalOpen(true);
  };

  const handlePreview = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsPreviewOpen(true);
  };

  const handleEdit = (documento: Documento) => {
    if (!canUserEditDocument(documento)) {
      alert('Você só pode editar documentos que foram criados por você.');
      return;
    }
    setSelectedDocumento(documento);
    setIsEditModalOpen(true);
  };

  const canUserEditDocument = (documento: Documento): boolean => {
    if (!user) return false;
    if (['admin', 'org_admin', 'superadmin'].includes(user.role)) return true;
    if (user.role === 'editor') return true;
    const docUserId = typeof documento.usuario === 'string' ? documento.usuario : documento.usuario?._id;
    return docUserId === user._id;
  };

  const handleSaveEdit = async (documento: Documento, formData: any) => {
    if (!canUserEditDocument(documento)) {
      throw new Error('Você não tem permissão para editar este documento.');
    }
    const updateData: any = {};
    if (formData.titulo?.trim()) updateData.titulo = formData.titulo.trim();
    if (formData.descricao?.trim()) updateData.descricao = formData.descricao.trim();
    if (formData.tipoMovimento) updateData.tipoMovimento = formData.tipoMovimento;
    if (formData.remetente?.trim()) updateData.remetente = formData.remetente.trim();
    if (formData.destinatario?.trim()) updateData.destinatario = formData.destinatario.trim();
    if (formData.responsavel?.trim()) updateData.responsavel = formData.responsavel.trim();
    if (formData.dataEnvio) updateData.dataEnvio = `${formData.dataEnvio}T00:00:00.000Z`;
    if (formData.dataRecebimento) updateData.dataRecebimento = `${formData.dataRecebimento}T00:00:00.000Z`;
    if (formData.status) updateData.ativo = formData.status === 'ativo';

    await DocumentosService.atualizar(documento._id, updateData);
    refetch();
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const filterFields: SearchFilterField[] = useMemo(() => [
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
  ], []);

  const columns: TableColumn[] = [
    {
      key: 'titulo',
      title: 'Documento',
      sortable: true,
      ellipsis: true,
      maxWidth: '350px',
      render: (value, record: any) => (
        <div className="flex items-center space-x-3">
          <FileText className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 dark:text-gray-100 truncate">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate">{record.descricao}</div>
            )}
            <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 flex items-center space-x-2 min-w-0">
              <span className="truncate">{record.arquivo?.originalName || 'Arquivo não encontrado'}</span>
              <span className="flex-shrink-0">·</span>
              <span className="flex-shrink-0">{formatFileSize(record.arquivo?.size || 0)}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoria',
      width: 'w-32',
      render: (value: any, record: any) => (
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: value?.cor || '#6B7280' }} />
            <span className="text-sm font-medium">{value?.nome || 'N/A'}</span>
          </div>
          {record.tipo && typeof record.tipo === 'object' && record.tipo.nome && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-5 truncate">{record.tipo.nome}</div>
          )}
        </div>
      ),
    },
    {
      key: 'tipoMovimento',
      title: 'Movimento',
      width: 'w-28',
      render: (value: string, record: any) => {
        const cfg: Record<string, { bg: string; text: string; label: string }> = {
          recebido: { bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-800 dark:text-blue-300', label: 'Recebido' },
          enviado:  { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Enviado' },
          interno:  { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-700 dark:text-gray-300', label: 'Interno' },
        };
        const c = cfg[value] || cfg.interno;
        const person =
          value === 'recebido' ? record.remetente :
          value === 'enviado'  ? record.destinatario :
          record.responsavel;

        return (
          <div className="space-y-0.5">
            <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${c.bg} ${c.text}`}>{c.label}</span>
            {person && (
              <div className="text-xs text-gray-600 dark:text-gray-400 truncate max-w-[100px]" title={person}>{person}</div>
            )}
          </div>
        );
      },
    },
    {
      key: 'dataCriacao',
      title: 'Data',
      sortable: true,
      width: 'w-28',
      render: (value: string, record: any) => (
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
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(value).toLocaleDateString('pt-BR')}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'actions',
      title: 'Ações',
      width: 'w-36',
      render: (_, record: Documento) => (
        <div className="flex items-center space-x-1">
          <button onClick={() => handlePreview(record)} className="p-1.5 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 rounded transition-colors" title="Pré-visualizar">
            <Eye className="w-4 h-4" />
          </button>
          <button onClick={() => handleDownload(record)} className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors" title="Download">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={() => handleView(record)} className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded transition-colors" title="Detalhes">
            <FileText className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(record)}
            className={`p-1.5 rounded transition-colors ${canUserEditDocument(record) ? 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
            title={canUserEditDocument(record) ? 'Editar' : 'Sem permissão para editar'}
            disabled={!canUserEditDocument(record)}
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <UserLayout>
      <div>
        <SearchFilterBar
          title={`Documentos${user?.departamento?.nome ? ` — ${user.departamento.nome}` : ' do Departamento'}`}
          subtitle="Documentos do seu departamento"
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          onSearch={handleSearch}
          searchPlaceholder="Pesquisar documentos..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          categorias={categorias}
          tipos={tiposFiltrados}
        />

        <DataTable
          data={documentos as Documento[]}
          columns={columns}
          actions={[]}
          loading={loading}
          emptyMessage="Nenhum documento encontrado no seu departamento"
          pagination={paginationProps}
          onSort={handleSort}
        />

        {selectedDocumento && (
          <DocumentPreview
            isOpen={isPreviewOpen}
            onClose={() => { setIsPreviewOpen(false); setSelectedDocumento(null); }}
            documento={selectedDocumento}
            onDownload={() => handleDownload(selectedDocumento)}
          />
        )}

        <DocumentoViewModal
          documento={selectedDocumento}
          isOpen={isViewModalOpen}
          onClose={() => { setIsViewModalOpen(false); setSelectedDocumento(null); }}
          onEdit={handleEdit}
          onDownload={handleDownload}
        />

        <DocumentoEditModal
          documento={selectedDocumento}
          isOpen={isEditModalOpen}
          onClose={() => { setIsEditModalOpen(false); setSelectedDocumento(null); }}
          onSave={handleSaveEdit}
        />
      </div>
    </UserLayout>
  );
};

export default DocumentosDepartamentoPage;
