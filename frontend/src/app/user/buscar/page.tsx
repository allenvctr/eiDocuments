"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import UserLayout from '@/components/ui/UserLayout';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { 
  Search, 
  FileText, 
  Eye, 
  Download, 
  Building2, 
  FolderOpen, 
  Tag, 
  Calendar, 
  Filter,
  X
} from 'lucide-react';
import { Documento } from '@/types';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useAuth } from '@/hooks/useAuth';

// Dynamic import to avoid SSR issues with react-pdf
const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);

const BuscarDocumentosPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Documento[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [filtros, setFiltros] = useState({
    categoria: '',
    departamento: '',
    tipoMovimento: '',
    dataInicio: '',
    dataFim: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  const { buscarPorTexto, baixar } = useDocumentos();
  const { user } = useAuth();
  const { categorias, carregarPorDepartamento } = useCategorias();
  
  const userDepartmentId = user?.departamento?._id;

  // Carregar categorias do departamento do usuário
  useEffect(() => {
    if (userDepartmentId) {
      carregarPorDepartamento(userDepartmentId, true);
    }
  }, [userDepartmentId, carregarPorDepartamento]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const response = await buscarPorTexto(searchQuery);
      setSearchResults(response.data || []);
    } catch (err) {
      console.error('Erro na busca:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
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
    setIsPreviewOpen(true);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getMovementBadge = (tipoMovimento: string, record: any) => {
    const movementConfig: Record<string, { bg: string; text: string; label: string }> = {
      'recebido': { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Recebido' },
      'enviado': { bg: 'bg-green-100', text: 'text-green-800', label: 'Enviado' },
      'interno': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Interno' }
    };
    
    const config = movementConfig[tipoMovimento] || movementConfig.interno;
    
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const columns: TableColumn[] = [
    {
      key: 'titulo',
      title: 'Documento',
      sortable: true,
      render: (value, record: any) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-gray-900 truncate">{value}</div>
            {record.descricao && (
              <div className="text-sm text-gray-500 truncate">{record.descricao}</div>
            )}
            <div className="text-xs text-gray-400 mt-1 flex items-center space-x-2">
              <span>{record.arquivo?.originalName || 'Arquivo não encontrado'}</span>
              <span>•</span>
              <span>{formatFileSize(record.arquivo?.size || 0)}</span>
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
          <Building2 className="w-4 h-4 text-gray-400" />
          <div>
            <div className="font-medium text-sm">{value?.nome || 'N/A'}</div>
            <div className="text-xs text-gray-500">{value?.codigo || ''}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'categoria',
      title: 'Categoria',
      width: 'w-28',
      render: (value: any) => (
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-${value?.cor || 'gray'}-500`}></div>
          <span className="text-sm">{value?.nome || 'N/A'}</span>
        </div>
      ),
    },
    {
      key: 'tipoMovimento',
      title: 'Tipo',
      width: 'w-24',
      render: (value, record: any) => getMovementBadge(value, record),
    },
    {
      key: 'tags',
      title: 'Tags',
      width: 'w-32',
      render: (value: string[]) => (
        <div className="flex flex-wrap gap-1">
          {value?.slice(0, 2).map((tag: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
            >
              <Tag className="w-3 h-3 mr-1" />
              {tag}
            </span>
          )) || []}
          {value?.length > 2 && (
            <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              +{value.length - 2}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'dataCriacao',
      title: 'Data',
      sortable: true,
      width: 'w-24',
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(value)}</span>
        </div>
      ),
    },
  ];

  const actions: TableAction[] = [
    {
      key: 'preview',
      label: 'Pré-visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: handleView,
    },
    {
      key: 'download',
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: handleDownload,
      variant: 'success',
    },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header de Busca */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Buscar Documentos</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Encontre documentos por título, descrição, tags ou conteúdo</p>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center self-start sm:self-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </button>
          </div>

          {/* Barra de Busca */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite sua busca aqui..."
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200" />
                </button>
              )}
            </div>
            <button
              onClick={handleSearch}
              disabled={!searchQuery.trim() || isSearching}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>

          {/* Filtros Avançados */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">Filtros Avançados</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Categoria
                  </label>
                  <select
                    value={filtros.categoria}
                    onChange={(e) => setFiltros({...filtros, categoria: e.target.value})}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categorias.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={user?.departamento?.nome || ''}
                    disabled
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    title="Você só pode buscar documentos do seu departamento"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Tipo de Movimento
                  </label>
                  <select
                    value={filtros.tipoMovimento}
                    onChange={(e) => setFiltros({...filtros, tipoMovimento: e.target.value})}
                    className="block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">Todos os tipos</option>
                    <option value="recebido">Recebido</option>
                    <option value="enviado">Enviado</option>
                    <option value="interno">Interno</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Resultados */}
        {hasSearched && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Resultados da Busca
                {searchResults.length > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({searchResults.length} documento{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-1">
                  Buscando por: "<span className="font-medium">{searchQuery}</span>"
                </p>
              )}
            </div>

            <DataTable
              data={searchResults}
              columns={columns}
              actions={actions}
              loading={isSearching}
              emptyMessage={
                <div className="text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum documento encontrado
                  </h3>
                  <p className="text-gray-500">
                    Tente usar termos diferentes ou verifique a ortografia
                  </p>
                </div>
              }
              onSort={(column, direction) => {
                console.log('Ordenar por:', column, direction);
              }}
            />
          </div>
        )}

        {/* Estado inicial */}
        {!hasSearched && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 sm:p-12 text-center">
            <Search className="mx-auto h-16 w-16 text-gray-300 mb-6" />
            <h2 className="text-xl font-medium text-gray-900 mb-3">
              Busque por documentos
            </h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Use a barra de busca acima para encontrar documentos por título, descrição, tags ou conteúdo. 
              Você também pode usar os filtros avançados para refinar sua busca.
            </p>
            <div className="text-sm text-gray-500">
              <p><strong>Dicas de busca:</strong></p>
              <ul className="mt-2 space-y-1 text-left max-w-md mx-auto">
                <li>• Use palavras-chave específicas</li>
                <li>• Combine múltiplos termos</li>
                <li>• Use aspas para frases exatas</li>
                <li>• Utilize os filtros para resultados mais precisos</li>
              </ul>
            </div>
          </div>
        )}

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
      </div>
    </UserLayout>
  );
};

export default BuscarDocumentosPage;
