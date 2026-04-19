"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import UserLayout from '@/components/ui/UserLayout';
import PageHeader from '@/components/ui/PageHeader';
import DataTable, { TableColumn, TableAction } from '@/components/ui/DataTable';
import { FileText, Eye, Download, Building2, FolderOpen, Calendar, User, Edit } from 'lucide-react';
import { Documento } from '@/types';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useAuth } from '@/hooks/useAuth';
import { DocumentosService } from '@/services/documentosService';
import DocumentoViewModal from '@/components/details/DocumentoViewModal';
import DocumentoEditModal from '@/components/forms/DocumentoEditModal';

// Dynamic import to avoid SSR issues with react-pdf
const DocumentPreview = dynamic(
  () => import('@/components/ui/DocumentPreview').then(mod => ({ default: mod.DocumentPreview })),
  { ssr: false }
);

const DocumentosDepartamentoPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDocumento, setSelectedDocumento] = useState<Documento | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { user } = useAuth();
  
  const {
    documentos,
    loading,
    carregar,
    buscarPorTexto,
    buscarPorDepartamento,
    baixar
  } = useDocumentos();

  const userDepartmentId = user?.departamento?._id;

  useEffect(() => {
    if (userDepartmentId) {
      buscarPorDepartamento(userDepartmentId);
    }
  }, [userDepartmentId, buscarPorDepartamento]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!userDepartmentId) return;
    if (!query.trim()) {
      buscarPorDepartamento(userDepartmentId);
      return;
    }
    buscarPorDepartamento(userDepartmentId, { q: query });
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
    setIsViewModalOpen(true); // Abre modal de detalhes
  };

  const handlePreview = (documento: Documento) => {
    setSelectedDocumento(documento);
    setIsPreviewOpen(true); // Abre preview do documento
  };

  const handleEdit = (documento: Documento) => {
    // Verificar se o usuário pode editar este documento
    const canEdit = canUserEditDocument(documento);
    if (!canEdit) {
      alert('Você só pode editar documentos que foram criados por você.');
      return;
    }
    
    setSelectedDocumento(documento);
    setIsEditModalOpen(true);
  };

  const canUserEditDocument = (documento: Documento): boolean => {
    // Usuário pode editar apenas documentos que ele criou
    const usuarioId = typeof documento.usuario === 'string' ? documento.usuario : documento.usuario?._id;
    const usuarioNome = typeof documento.usuario === 'string' ? '' : documento.usuario?.nome;
    return usuarioId === user?._id || usuarioNome === user?.nome;
  };

  const handleSaveEdit = async (documento: Documento, formData: any) => {
    try {
      console.log('Salvando edições do documento:', documento._id, formData);
      
      // Verificar permissão novamente antes de salvar
      if (!canUserEditDocument(documento)) {
        throw new Error('Você não tem permissão para editar este documento.');
      }
      
      // Preparar dados para atualização
      const updateData: any = {};
      
      // Apenas incluir campos que têm valores (categoria e tipo omitidos por enquanto)
      if (formData.titulo?.trim()) updateData.titulo = formData.titulo.trim();
      if (formData.descricao?.trim()) updateData.descricao = formData.descricao.trim();
      if (formData.tipoMovimento) updateData.tipoMovimento = formData.tipoMovimento;
      if (formData.remetente?.trim()) updateData.remetente = formData.remetente.trim();
      if (formData.destinatario?.trim()) updateData.destinatario = formData.destinatario.trim();
      if (formData.responsavel?.trim()) updateData.responsavel = formData.responsavel.trim();
      if (formData.dataEnvio) updateData.dataEnvio = formData.dataEnvio + 'T00:00:00.000Z';
      if (formData.dataRecebimento) updateData.dataRecebimento = formData.dataRecebimento + 'T00:00:00.000Z';
      if (formData.tags && formData.tags.length > 0) updateData.tags = formData.tags;
      if (formData.status) updateData.ativo = formData.status === 'ativo';

      console.log('Dados preparados para atualização:', updateData);

      // Atualizar documento via serviço
      await DocumentosService.atualizar(documento._id, updateData);
      
      // Recarregar documentos do departamento
      if (userDepartmentId) {
        buscarPorDepartamento(userDepartmentId);
      }
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
      throw error;
    }
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
      <div className="space-y-1">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
          {config.label}
        </span>
        {person && (
          <div className="text-sm">
            <div className="text-xs text-gray-500">{personLabel}</div>
            <div className="text-gray-900 font-medium truncate">{person}</div>
          </div>
        )}
      </div>
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
      key: 'categoria',
      title: 'Categoria',
      width: 'w-32',
      render: (value: any, record: any) => (
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full bg-${value?.cor || 'gray'}-500 flex-shrink-0`}></div>
          <div>
            <div className="font-medium text-sm">{value?.nome || 'N/A'}</div>
            {record.tipo && (
              <div className="text-xs text-gray-500">{record.tipo.nome}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'tipoMovimento',
      title: 'Tipo/Responsável',
      sortable: false,
      width: 'w-40',
      render: (value, record: any) => getMovementBadge(value, record),
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
    {
      key: 'actions',
      title: 'Ações',
      width: 'w-40',
      render: (value, record: Documento) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePreview(record)}
            className="p-1 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded transition-colors"
            title="Pré-visualizar"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDownload(record)}
            className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleView(record)}
            className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded transition-colors"
            title="Detalhes"
          >
            <FileText className="w-4 h-4" />
          </button>
          {canUserEditDocument(record) && (
            <button
              onClick={() => handleEdit(record)}
              className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
              title="Editar"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {!canUserEditDocument(record) && (
            <div className="p-1 text-gray-300" title="Você não pode editar este documento">
              <Edit className="w-4 h-4" />
            </div>
          )}
        </div>
      ),
    },
  ];



  return (
    <UserLayout>
      <div>
        <PageHeader
          title={`Documentos ${user?.departamento?.nome ? `- ${user.departamento.nome}` : 'do Departamento'}`}
          subtitle={`Acesse e visualize documentos ${user?.departamento?.nome ? `do departamento ${user.departamento.nome}` : 'do seu departamento'}`}
          onSearch={handleSearch}
          onFilter={() => console.log('Filtrar documentos')}
          searchPlaceholder="Pesquisar documentos..."
        />

        <DataTable
          data={documentos}
          columns={columns}
          actions={[]} // Remover ações fixas, usar ações dinâmicas na coluna
          loading={loading}
          emptyMessage="Nenhum documento encontrado no seu departamento"
          onSort={(column, direction) => {
            console.log('Ordenar por:', column, direction);
          }}
        />

        {/* Modais */}
        {/* Preview do Documento */}
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

        {/* Detalhes do Documento */}
        <DocumentoViewModal
          documento={selectedDocumento}
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDocumento(null);
          }}
          onEdit={handleEdit}
          onDownload={handleDownload}
        />

        {/* Edição do Documento */}
        <DocumentoEditModal
          documento={selectedDocumento}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedDocumento(null);
          }}
          onSave={handleSaveEdit}
        />
      </div>
    </UserLayout>
  );
};

export default DocumentosDepartamentoPage;
