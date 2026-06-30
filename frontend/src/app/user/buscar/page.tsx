"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import UserLayout from '@/components/ui/UserLayout';
import SearchFilterBar, { SearchFilterField } from '@/components/ui/SearchFilterBar';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { Search, FileText, Eye, Download, Building2, Calendar } from 'lucide-react';
import { Documento } from '@/types';
import { DocumentoQueryParams } from '@/services/documentosService';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useTipos } from '@/hooks/useTipos';
import { useAuth } from '@/hooks/useAuth';

const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);

const BuscarDocumentosPage = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState<Documento[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const { buscarPorTexto, baixar } = useDocumentos();
  const { user } = useAuth();
  const { categorias, carregarPorDepartamento } = useCategorias();
  const { tipos, carregar: carregarTipos } = useTipos();

  const userDepartmentId = user?.departamento?._id;

  useEffect(() => {
    if (userDepartmentId) {
      carregarPorDepartamento(userDepartmentId, true);
      carregarTipos({ limit: 100 });
    }
  }, [userDepartmentId, carregarPorDepartamento, carregarTipos]);

  const handleClearSearch = () => {
    setSearchValue('');
    setHasSearched(false);
    setSearchResults([]);
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const filtrosAPI: Omit<DocumentoQueryParams, 'q'> = {};
      if (activeFilters.categoria) filtrosAPI.categoria = activeFilters.categoria;
      if (activeFilters.tipo) filtrosAPI.tipo = activeFilters.tipo;
      if (activeFilters.tipoMovimento) filtrosAPI.tipoMovimento = activeFilters.tipoMovimento as 'enviado' | 'recebido' | 'interno';
      if (activeFilters.dataEmissao_start) filtrosAPI.dataEmissaoInicio = `${activeFilters.dataEmissao_start}T00:00:00.000Z`;
      if (activeFilters.dataEmissao_end) filtrosAPI.dataEmissaoFim = `${activeFilters.dataEmissao_end}T23:59:59.999Z`;

      const response = await buscarPorTexto(searchValue, filtrosAPI);
      setSearchResults(response.data || []);
    } catch (err) {
      console.error('Erro na busca:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setActiveFilters(prev => {
      const next = { ...prev };
      if (value) { next[key] = value; } else { delete next[key]; }
      return next;
    });
  };

  const handleClearFilters = () => {
    setActiveFilters({});
  };

  const handleDownload = async (documento: Documento) => {
    try {
      await baixar(documento._id);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
    }
  };

  const handlePreview = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsPreviewOpen(true);
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
      key: 'departamento',
      title: 'Departamento',
      width: 'w-32',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
          <div>
            <div className="font-medium text-sm">{value?.nome || 'N/A'}</div>
            {value?.codigo && <div className="text-xs text-gray-500 dark:text-gray-400">{value.codigo}</div>}
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoria',
      width: 'w-28',
      render: (value: any, record: any) => (
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: value?.cor || '#6B7280' }} />
            <span className="text-sm">{value?.nome || 'N/A'}</span>
          </div>
          {record.tipo && typeof record.tipo === 'object' && record.tipo.nome && (
            <div className="text-xs text-gray-500 dark:text-gray-400 pl-5 truncate">{record.tipo.nome}</div>
          )}
        </div>
      ),
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
          <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {new Date(value).toLocaleDateString('pt-BR')}
          </div>
        </div>
      ),
    },
  ];

  const actions: TableAction[] = [
    { key: 'preview',  label: 'Pré-visualizar', icon: <Eye className="w-4 h-4" />,     onClick: handlePreview },
    { key: 'download', label: 'Download',        icon: <Download className="w-4 h-4" />, onClick: handleDownload, variant: 'success' },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        <SearchFilterBar
          title="Buscar Documentos"
          subtitle="Encontre documentos por título, descrição ou conteúdo"
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          onSearch={handleSearch}
          showSearchButton={true}
          onClearSearch={handleClearSearch}
          searchPlaceholder="Digite sua busca aqui..."
          filterFields={filterFields}
          activeFilters={activeFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          categorias={categorias}
          tipos={tipos}
        />

        {/* Resultados */}
        {hasSearched && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                Resultados da Busca
                {searchResults.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                    — {searchResults.length} documento{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Buscando por: "<span className="font-medium text-gray-700 dark:text-gray-300">{searchValue}</span>"
              </p>
            </div>

            <DataTable
              data={searchResults}
              columns={columns}
              actions={actions}
              loading={isSearching}
              emptyMessage={
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className="text-base font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Nenhum documento encontrado
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Tente usar termos diferentes ou ajuste os filtros
                  </p>
                </div>
              }
              onSort={() => {}}
            />
          </div>
        )}

        {/* Estado inicial */}
        {!hasSearched && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Search className="mx-auto h-14 w-14 text-gray-200 dark:text-gray-700 mb-5" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Busque por documentos
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Use a barra de busca acima para encontrar documentos por título, descrição ou conteúdo.
              Use os filtros para refinar por categoria, tipo ou período de emissão.
            </p>
          </div>
        )}

        {selectedDocumento && (
          <DocumentPreview
            isOpen={isPreviewOpen}
            onClose={() => { setIsPreviewOpen(false); setSelectedDocumento(null); }}
            documento={selectedDocumento}
            onDownload={() => handleDownload(selectedDocumento)}
          />
        )}
      </div>
    </UserLayout>
  );
};

export default BuscarDocumentosPage;
