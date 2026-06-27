"use client";

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import DetailModal from '@/components/ui/DetailModal';
import { Documento, CategoriaDocumento } from '@/types';

// Dynamic import to avoid SSR issues with react-pdf
const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);
import { 
  FileText, 
  Calendar, 
  Building2, 
  User, 
  File,
  Download,
  Clock,
  Send,
  Inbox,
  Home,
  CheckCircle,
  XCircle,
  Archive,
  Eye,
} from 'lucide-react';

interface DocumentoDetailProps {
  isOpen: boolean;
  onClose: () => void;
  documento: Documento | null;
  onDownload?: (documento: Documento) => void;
}

const DocumentoDetail: React.FC<DocumentoDetailProps> = ({
  isOpen,
  onClose,
  documento,
  onDownload
}) => {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!documento) return null;

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getMovementIcon = (tipoMovimento: string) => {
    switch (tipoMovimento) {
      case 'enviado': return <Send className="w-4 h-4" />;
      case 'recebido': return <Inbox className="w-4 h-4" />;
      case 'interno': return <Home className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getMovementColor = (tipoMovimento: string) => {
    switch (tipoMovimento) {
      case 'enviado': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
      case 'recebido': return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
      case 'interno': return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300';
    }
  };

  const getMovementLabel = (tipoMovimento: string) => {
    switch (tipoMovimento) {
      case 'enviado': return 'Enviado';
      case 'recebido': return 'Recebido';
      case 'interno': return 'Interno';
      default: return 'Desconhecido';
    }
  };

  const getEntityName = (entity: string | { nome?: string; titulo?: string }): string => {
    if (typeof entity === 'string') {
      return 'Carregando...';
    }
    return entity?.nome || entity?.titulo || 'N/A';
  };

  const getCategoryColor = (categoria: string | CategoriaDocumento) => {
    if (typeof categoria === 'object' && categoria.cor) {
      return categoria.cor;
    }
    return '#6b7280';
  };

  const handleDownload = () => {
    if (onDownload) {
      onDownload(documento);
    }
  };

  return (
    <>
      <DetailModal
        isOpen={isOpen}
        onClose={onClose}
        title=""
        size="xl"
      >
        {/* HEADER DESTACADO */}
        <div className="rounded-t-lg bg-gradient-to-r from-green-600 to-green-400 p-6 flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center shadow-lg">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold text-white truncate">{documento.titulo}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getMovementColor(documento.tipoMovimento)} bg-opacity-80`}>{getMovementIcon(documento.tipoMovimento)}<span className="ml-1">{getMovementLabel(documento.tipoMovimento)}</span></span>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${documento.ativo ? 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300'}`}>{documento.ativo ? (<><CheckCircle className="w-3 h-3 mr-1" />Ativo</>) : (<><XCircle className="w-3 h-3 mr-1" />Inativo</>)}</span>
              {documento.status === 'arquivado' && (<span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300"><Archive className="w-3 h-3 mr-1" />Arquivado</span>)}
            </div>
          </div>
        </div>
        {/* DESCRIÇÃO */}
        {documento.descricao && (
          <div className="mb-4 px-6"><p className="text-gray-700 dark:text-gray-300 text-base">{documento.descricao}</p></div>
        )}
        {/* SEÇÃO ARQUIVO E PREVIEW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6 mb-6">
          <div className="md:col-span-2 flex flex-col items-center justify-center">
            <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500">
              <FileText className="w-12 h-12" />
            </div>
          </div>
          <div className="flex flex-col justify-between space-y-2 min-w-0">
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-1 flex items-center"><File className="w-4 h-4 mr-2" />Arquivo</h4>
              <p className="font-medium text-gray-900 dark:text-gray-100 break-all">{documento.arquivo?.originalName || 'Nome não disponível'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{documento.arquivo?.format?.toUpperCase() || 'Formato desconhecido'} • {formatFileSize(documento.arquivo?.size || 0)}</p>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                onClick={handleDownload}
                className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow"
                title="Download"
              >
                <Download className="w-4 h-4 mr-1" />Download
              </button>
              {documento.arquivo && (
                <button
                  onClick={() => setPreviewOpen(true)}
                  className="flex items-center px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors shadow"
                  title="Visualizar em tela cheia"
                >
                  <Eye className="w-4 h-4 mr-1" />Visualizar
                </button>
              )}
            </div>
          </div>
        </div>
        {/* METADADOS E MOVIMENTO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Classificação</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Building2 className="w-4 h-4 text-blue-500 dark:text-green-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Departamento</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getEntityName(documento.departamento)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-4 h-4 rounded-full border dark:border-gray-600" style={{ backgroundColor: getCategoryColor(documento.categoria) }}></div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Categoria</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getEntityName(documento.categoria)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <File className="w-4 h-4 text-purple-500 dark:text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Tipo</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {documento.tipo ? getEntityName(documento.tipo) : 'Sem tipo específico'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">Movimentação</h4>
            <div className="space-y-3">
              {documento.tipoMovimento === 'enviado' && documento.destinatario && (
                <div className="flex items-center space-x-3">
                  <Send className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Destinatário</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{documento.destinatario}</p>
                  </div>
                </div>
              )}
              {documento.dataEmissao && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data de Emissão</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(documento.dataEmissao)}</p>
                  </div>
                </div>
              )}
              {documento.tipoMovimento === 'enviado' && documento.dataEnvio && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data de Envio</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(documento.dataEnvio)}</p>
                  </div>
                </div>
              )}
              {documento.tipoMovimento === 'recebido' && documento.remetente && (
                <div className="flex items-center space-x-3">
                  <Inbox className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Remetente</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{documento.remetente}</p>
                  </div>
                </div>
              )}
              {documento.tipoMovimento === 'recebido' && documento.dataRecebimento && (
                <div className="flex items-center space-x-3">
                  <Calendar className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Data de Recebimento</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{formatDate(documento.dataRecebimento)}</p>
                  </div>
                </div>
              )}
              {documento.tipoMovimento === 'interno' && documento.responsavel && (
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Responsável</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{documento.responsavel}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-3">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Criado por</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getEntityName(documento.usuario)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* METADADOS DO SISTEMA */}
        <div className="border-t pt-4 px-6">
          <h4 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center"><Clock className="w-4 h-4 mr-2" />Informações do Sistema</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 dark:text-gray-400">Data de Criação:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDate(documento.dataCriacao)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400">Última Atualização:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDate(documento.dataAtualizacao)}</span>
            </div>
            {documento.ultimaEdicao && documento.ultimaEdicao.usuario && (
              <>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Modificado por:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{getEntityName(documento.ultimaEdicao.usuario)}</span>
                </div>
                {documento.ultimaEdicao.descricao && (
                  <div className="md:col-span-2">
                    <span className="text-gray-500 dark:text-gray-400">Descrição da edição:</span>
                    <span className="ml-2 text-gray-900 dark:text-gray-100">{documento.ultimaEdicao.descricao}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </DetailModal>
      {/* Document Preview Modal */}
      <DocumentPreview
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        documento={documento}
        onDownload={handleDownload}
      />
    </>
  );
};

export default DocumentoDetail;
