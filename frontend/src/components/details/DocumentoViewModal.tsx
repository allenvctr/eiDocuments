"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Calendar, User, Building2, Download, Edit2, AlertCircle } from 'lucide-react';
import DetailModal from '@/components/ui/DetailModal';
import { Documento } from '@/types';
import { DocumentosService } from '@/services/documentosService';

interface DocumentoViewModalProps {
  documento: Documento | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (documento: Documento) => void;
  onDownload: (documento: Documento) => void;
}

const IMAGE_FORMATS = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
const PDF_FORMATS = ['pdf'];
const OFFICE_FORMATS = ['xlsx', 'xls', 'docx', 'doc', 'pptx', 'ppt', 'odt', 'ods', 'odp'];

const DocumentoViewModal: React.FC<DocumentoViewModalProps> = ({
  documento,
  isOpen,
  onClose,
  onEdit,
  onDownload,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (!isOpen || !documento?._id) {
      setPreviewUrl(null);
      setPreviewError(false);
      return;
    }

    setPreviewLoading(true);
    setPreviewError(false);
    setPreviewUrl(null);

    DocumentosService.getPreviewUrl(documento._id)
      .then(({ url }) => setPreviewUrl(url))
      .catch(() => setPreviewError(true))
      .finally(() => setPreviewLoading(false));
  }, [isOpen, documento?._id]);

  if (!documento) return null;

  const format = documento.arquivo?.format?.toLowerCase() || '';
  const isImage = IMAGE_FORMATS.includes(format);
  const isPdf = PDF_FORMATS.includes(format);
  const isOffice = OFFICE_FORMATS.includes(format);
  const canPreview = isImage || isPdf || isOffice;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || isNaN(bytes)) return '0 KB';
    const mb = bytes / (1024 * 1024);
    return mb < 1 ? `${(bytes / 1024).toFixed(1)} KB` : `${mb.toFixed(1)} MB`;
  };

  const getMovementBadge = (tipoMovimento: string, record: Documento) => {
    const movementConfig: Record<string, { bg: string; text: string; label: string }> = {
      recebido: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Recebido' },
      enviado: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Enviado' },
      interno: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Interno' },
    };
    const config = movementConfig[tipoMovimento] ?? movementConfig.interno;

    let person = '';
    let personLabel = '';
    if (tipoMovimento === 'recebido' && record.remetente) {
      person = record.remetente;
      personLabel = 'De:';
    } else if (tipoMovimento === 'enviado' && record.destinatario) {
      person = record.destinatario;
      personLabel = 'Para:';
    } else if (tipoMovimento === 'interno' && record.responsavel) {
      person = record.responsavel;
      personLabel = 'Responsável:';
    }

    return (
      <div className="space-y-2">
        <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        {person && (
          <div className="text-sm">
            <div className="text-gray-500 dark:text-gray-400 font-medium">{personLabel}</div>
            <div className="text-gray-900 dark:text-gray-100">{person}</div>
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      ativo: { bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-800 dark:text-green-300', label: 'Ativo' },
      arquivado: { bg: 'bg-yellow-100 dark:bg-yellow-900/40', text: 'text-yellow-800 dark:text-yellow-300', label: 'Arquivado' },
      rascunho: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-800 dark:text-gray-300', label: 'Rascunho' },
    };
    const config = statusConfig[status] ?? statusConfig.ativo;
    return (
      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const renderPreview = () => {
    if (previewLoading) {
      return (
        <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            A carregar pré-visualização...
          </div>
        </div>
      );
    }

    if (previewError || !canPreview) {
      return (
        <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg text-sm text-gray-500 dark:text-gray-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Pré-visualização não disponível para este tipo de ficheiro. Faça o download para visualizar.
        </div>
      );
    }

    if (!previewUrl) return null;

    if (isPdf) {
      return (
        <iframe
          src={previewUrl}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
          style={{ height: '520px' }}
          title={documento.arquivo?.originalName}
        />
      );
    }

    if (isOffice) {
      const viewerUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(previewUrl)}`;
      return (
        <iframe
          src={viewerUrl}
          className="w-full rounded-lg border border-gray-200 dark:border-gray-700"
          style={{ height: '520px' }}
          title={documento.arquivo?.originalName}
        />
      );
    }

    if (isImage) {
      return (
        <div className="flex justify-center bg-gray-50 dark:bg-gray-900/40 rounded-lg p-2">
          <img
            src={previewUrl}
            alt={documento.arquivo?.originalName}
            className="max-h-96 max-w-full object-contain rounded"
          />
        </div>
      );
    }

    return null;
  };

  const footer = (
    <>
      <button
        onClick={onClose}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        Fechar
      </button>
      <button
        onClick={() => onDownload(documento)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Download className="w-4 h-4" />
        Download
      </button>
      <button
        onClick={() => onEdit(documento)}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
      >
        <Edit2 className="w-4 h-4" />
        Editar
      </button>
    </>
  );

  return (
    <DetailModal
      isOpen={isOpen}
      onClose={onClose}
      title={documento.titulo}
      size="xl"
      footer={footer}
    >
      <div className="space-y-6">
        {/* Preview pane */}
        {(canPreview || previewLoading) && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Pré-visualização</h3>
            {renderPreview()}
          </div>
        )}

        {/* Metadata grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6 min-w-0">
            {documento.descricao && (
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Descrição</h3>
                <p className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/40 p-4 rounded-lg">{documento.descricao}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Categoria</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor:
                        typeof documento.categoria === 'object' && documento.categoria?.cor
                          ? documento.categoria.cor
                          : '#6b7280',
                    }}
                  />
                  <span className="text-sm font-medium">
                    {typeof documento.categoria === 'object' && documento.categoria?.nome
                      ? documento.categoria.nome
                      : 'N/A'}
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tipo</h3>
                <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <span className="text-sm font-medium">
                    {typeof documento.tipo === 'object' && documento.tipo?.nome
                      ? documento.tipo.nome
                      : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tipo de Movimento</h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                {getMovementBadge(documento.tipoMovimento, documento)}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-5 min-w-0">
            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Status</h3>
              {getStatusBadge(documento.status || 'ativo')}
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Arquivo</h3>
              <div className="p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg space-y-1">
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100 break-all">
                  {documento.arquivo?.originalName || 'Arquivo não encontrado'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(documento.arquivo?.size || 0)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {documento.arquivo?.format?.toUpperCase() || 'Tipo não identificado'}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Departamento</h3>
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                <span className="text-sm font-medium">
                  {typeof documento.departamento === 'object' && documento.departamento?.nome
                    ? documento.departamento.nome
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Criado por</h3>
              <div className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium">
                  {documento.usuario && typeof documento.usuario === 'object' && documento.usuario?.nome
                    ? documento.usuario.nome
                    : 'Não informado'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Data de Criação</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                  <span className="text-sm">{formatDate(documento.dataCriacao)}</span>
                </div>
              </div>
              {documento.dataAtualizacao && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Última Atualização</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{formatDate(documento.dataAtualizacao)}</span>
                  </div>
                </div>
              )}
              {documento.dataEnvio && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Data de Envio</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{formatDate(documento.dataEnvio)}</span>
                  </div>
                </div>
              )}
              {documento.dataRecebimento && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Data de Recebimento</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                    <Calendar className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <span className="text-sm">{formatDate(documento.dataRecebimento)}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DetailModal>
  );
};

export default DocumentoViewModal;
