"use client";

import React, { useState, useEffect } from 'react';
import FormModal from '@/components/ui/FormModal';
import { CreateDocumento, UpdateDocumento, Documento } from '@/types';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useTipos } from '@/hooks/useTipos';
import { useAuth } from '@/hooks/useAuth';
import { UploadService } from '@/services/uploadService';
import { Upload, X, FileText } from 'lucide-react';

interface DocumentoFormProps {
  isOpen: boolean;
  onClose: () => void;
  documento?: Documento | null;
  onSuccess?: () => void;
}

const DocumentoForm: React.FC<DocumentoFormProps> = ({
  isOpen,
  onClose,
  documento,
  onSuccess
}) => {
  const { criar, atualizar } = useDocumentos();
  const { obterParaSelect: obterDepartamentos } = useDepartamentos();
  const { obterParaSelect: obterCategorias } = useCategorias();
  const { obterParaSelect: obterTipos, obterParaSelectPorDepartamento: obterTiposPorDep } = useTipos();
  const { user, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [departamentos, setDepartamentos] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [tiposFiltrados, setTiposFiltrados] = useState<{ value: string; label: string }[]>([]);
  
  const [formData, setFormData] = useState<CreateDocumento>({
    titulo: '',
    descricao: '',
    categoria: '',
    tipo: '',
    departamento: '',
    tipoMovimento: 'interno',
    remetente: '',
    destinatario: '',
    responsavel: '',
    dataEmissao: '',
    dataEnvio: '',
    dataRecebimento: '',
    status: 'ativo'
  });

  const isEditing = !!documento;

  // Função para converter data ISO para formato YYYY-MM-DD
  const formatDateForInput = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
  };

  useEffect(() => {
    if (isOpen) {
      // Carregar dados para selects
      loadSelectData();
      
      if (documento) {
        // Modo edição - preencher formulário
        setFormData({
          titulo: documento.titulo,
          descricao: documento.descricao || '',
          categoria: typeof documento.categoria === 'string' ? documento.categoria : documento.categoria._id,
          tipo: documento.tipo ? (typeof documento.tipo === 'string' ? documento.tipo : documento.tipo._id) : '',
          departamento: typeof documento.departamento === 'string' ? documento.departamento : documento.departamento._id,
          tipoMovimento: documento.tipoMovimento,
          remetente: documento.remetente || '',
          destinatario: documento.destinatario || '',
          responsavel: documento.responsavel || '',
          dataEmissao: formatDateForInput(documento.dataEmissao),
          dataEnvio: formatDateForInput(documento.dataEnvio),
          dataRecebimento: formatDateForInput(documento.dataRecebimento),
          status: documento.status
        });
        setSelectedFile(null); // Não permite alterar arquivo na edição
      } else {
        // Modo criação - limpar formulário
        setFormData({
          titulo: '',
          descricao: '',
          categoria: '',
          tipo: '',
          departamento: '',
          tipoMovimento: 'interno',
          remetente: '',
          destinatario: '',
          responsavel: '',
          dataEmissao: '',
          dataEnvio: '',
          dataRecebimento: '',
          status: 'ativo'
        });
        setSelectedFile(null);
      }
      setErrors({});
      setApiError(null);
    }
  }, [isOpen, documento]);

  const loadSelectData = async () => {
    try {
      const depsData = isAdmin() 
        ? await obterDepartamentos() 
        : user?.departamento?._id 
          ? [{ value: user.departamento._id, label: user.departamento.nome || 'Meu Departamento' }]
          : [];
      
      setDepartamentos(depsData);
      
      // Se editor/user, pré-selecionar departamento e carregar categorias
      if (!isAdmin() && user?.departamento && typeof user.departamento === 'object') {
        const departamentoId = user.departamento._id;
        setFormData(prev => ({ ...prev, departamento: departamentoId }));
        loadCategorias(departamentoId);
      }
    } catch (error) {
      console.error('Erro ao carregar dados para selects:', error);
    }
  };

  // Carregar categorias quando departamento mudar
  useEffect(() => {
    if (formData.departamento) {
      loadCategorias(formData.departamento);
    } else {
      setCategorias([]);
      setFormData(prev => ({ ...prev, categoria: '', tipo: '' }));
    }
  }, [formData.departamento]);

  const loadCategorias = async (departamentoId: string) => {
    try {
      const categoriesData = await obterCategorias(departamentoId);
      setCategorias(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategorias([]);
    }
  };

  // Carregar tipos da categoria selecionada (filtrados no backend por categoria)
  useEffect(() => {
    const loadTiposDaCategoria = async () => {
      if (!formData.categoria || !formData.departamento) {
        setTiposFiltrados([]);
        return;
      }

      try {
        const tiposData = isAdmin()
          ? await obterTipos(formData.categoria)
          : await obterTiposPorDep(formData.departamento, formData.categoria);

        setTiposFiltrados(tiposData);

        // Limpar tipo selecionado se não pertencer à categoria atual
        if (formData.tipo && !tiposData.some(t => t.value === formData.tipo)) {
          setFormData(prev => ({ ...prev, tipo: '' }));
        }
      } catch (error) {
        console.error('Erro ao carregar tipos da categoria:', error);
        setTiposFiltrados([]);
      }
    };

    loadTiposDaCategoria();
  }, [formData.categoria, formData.departamento]);

  // Para documentos internos, o responsável é sempre o utilizador autenticado
  useEffect(() => {
    if (formData.tipoMovimento === 'interno' && user?.nome && formData.responsavel !== user.nome) {
      setFormData(prev => ({ ...prev, responsavel: user.nome }));
    }
  }, [formData.tipoMovimento, formData.responsavel, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (file: File) => {
    const maxSize = 500 * 1024 * 1024; // 500MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'text/plain',
      'text/csv',
      'application/rtf',
      'application/zip',
      'application/x-zip-compressed',
      'application/x-rar-compressed',
      'application/vnd.rar',
      'video/mp4',
      'video/webm',
      'video/ogg',
      'video/quicktime',
      'video/x-msvideo',
      'video/x-ms-wmv',
    ];

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, arquivo: 'Arquivo muito grande. Tamanho máximo: 500 MB' }));
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      setErrors(prev => ({ ...prev, arquivo: 'Tipo de arquivo não suportado' }));
      return;
    }

    setSelectedFile(file);
    setErrors(prev => ({ ...prev, arquivo: '' }));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.titulo.trim()) {
      newErrors.titulo = 'Título é obrigatório';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    // Tipo é opcional - não validar

    if (!formData.departamento) {
      newErrors.departamento = 'Departamento é obrigatório';
    }

    // Validações específicas por tipo de movimento
    if (formData.tipoMovimento === 'enviado') {
      if (!formData.destinatario?.trim()) {
        newErrors.destinatario = 'Destinatário é obrigatório para documentos enviados';
      }
    } else if (formData.tipoMovimento === 'recebido') {
      if (!formData.remetente?.trim()) {
        newErrors.remetente = 'Remetente é obrigatório para documentos recebidos';
      }
    }

    // Arquivo obrigatório apenas na criação
    if (!isEditing && !selectedFile) {
      newErrors.arquivo = 'Arquivo é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setLoading(true);
      
      if (isEditing) {
        // Para atualização, filtrar apenas campos permitidos e converter datas
        const updateData: Partial<UpdateDocumento> = {
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria,
          tipo: formData.tipo,
          departamento: formData.departamento,
          tipoMovimento: formData.tipoMovimento,
          remetente: formData.remetente,
          destinatario: formData.destinatario,
          responsavel: formData.responsavel,
          dataEmissao: formData.dataEmissao ? new Date(formData.dataEmissao + 'T00:00:00').toISOString() : undefined,
          dataEnvio: formData.dataEnvio ? new Date(formData.dataEnvio + 'T00:00:00').toISOString() : undefined,
          dataRecebimento: formData.dataRecebimento ? new Date(formData.dataRecebimento + 'T00:00:00').toISOString() : undefined,
          status: formData.status,
          ativo: formData.status === 'ativo'
        };

        // Remover campos undefined
        Object.keys(updateData).forEach(key => {
          if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
          }
        });

        await atualizar(documento._id, updateData);
      } else {
        const documentoData = {
          ...formData,
          dataEmissao: formData.dataEmissao ? new Date(formData.dataEmissao + 'T00:00:00').toISOString() : undefined,
          dataEnvio: formData.dataEnvio ? new Date(formData.dataEnvio + 'T00:00:00').toISOString() : undefined,
          dataRecebimento: formData.dataRecebimento ? new Date(formData.dataRecebimento + 'T00:00:00').toISOString() : undefined,
          ativo: formData.status === 'ativo',
          arquivo: selectedFile!,
        };

        try {
          await UploadService.uploadComPresign({
            titulo: documentoData.titulo,
            descricao: documentoData.descricao,
            categoria: documentoData.categoria,
            tipo: documentoData.tipo || undefined,
            departamento: documentoData.departamento,
            tipoMovimento: documentoData.tipoMovimento as 'enviado' | 'recebido' | 'interno',
            remetente: documentoData.remetente || undefined,
            destinatario: documentoData.destinatario || undefined,
            responsavel: documentoData.responsavel || undefined,
            dataEmissao: documentoData.dataEmissao,
            dataEnvio: documentoData.dataEnvio,
            dataRecebimento: documentoData.dataRecebimento,
            arquivo: selectedFile!,
            onProgress: setUploadProgress,
          });
        } finally {
          setUploadProgress(null);
        }
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro ao salvar documento. Tente novamente.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Documento' : 'Novo Documento'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Erro de API (permissão, servidor, etc.) */}
        {apiError && (
          <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {apiError}
          </div>
        )}

        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Título *
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.titulo ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm`}
            placeholder="Digite o título do documento"
            disabled={loading}
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.titulo}</p>
          )}
        </div>

        {/* Linha 1: Departamento, Categoria, Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Departamento */}
          <div>
            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Departamento *
            </label>
            <select
              id="departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.departamento ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm`}
              disabled={loading}
            >
              <option value="">Selecione um departamento</option>
              {departamentos.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {errors.departamento && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.departamento}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Categoria *
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.categoria ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm`}
              disabled={loading || !formData.departamento}
            >
              <option value="">Selecione uma categoria</option>
              {categorias.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
            {errors.categoria && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.categoria}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tipo <span className="text-gray-400 dark:text-gray-500 text-xs">(opcional)</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.tipo ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm`}
              disabled={loading || !formData.categoria}
            >
              <option value="">
                {!formData.categoria 
                  ? 'Selecione uma categoria primeiro' 
                  : tiposFiltrados.length === 0 
                    ? 'Nenhum tipo disponível para esta categoria'
                    : 'Sem tipo específico'}
              </option>
              {tiposFiltrados.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
            {formData.categoria && tiposFiltrados.length === 0 && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Esta categoria não possui tipos específicos cadastrados.
              </p>
            )}
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tipo}</p>
            )}
          </div>
        </div>

        {/* Tipo de Movimento */}
        <div>
          <label htmlFor="tipoMovimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Tipo de Movimento *
          </label>
          <select
            id="tipoMovimento"
            name="tipoMovimento"
            value={formData.tipoMovimento}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm"
            disabled={loading}
          >
            <option value="interno">Interno</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
          </select>
        </div>

        {/* Data de Emissão — sempre visível, independente do tipo de movimento */}
        <div>
          <label htmlFor="dataEmissao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Data de Emissão <span className="text-gray-400 dark:text-gray-500 text-xs">(opcional)</span>
          </label>
          <input
            type="date"
            id="dataEmissao"
            name="dataEmissao"
            value={formData.dataEmissao}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm"
            disabled={loading}
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Data em que o documento foi emitido ou assinado, independente da data de registo no sistema.
          </p>
        </div>

        {/* Campos condicionais por tipo de movimento */}
        {formData.tipoMovimento === 'enviado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Destinatário *
              </label>
              <input
                type="text"
                id="destinatario"
                name="destinatario"
                value={formData.destinatario}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${errors.destinatario ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm`}
                placeholder="Nome do destinatário"
                disabled={loading}
              />
              {errors.destinatario && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.destinatario}</p>
              )}
            </div>
            <div>
              <label htmlFor="dataEnvio" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Envio
              </label>
              <input
                type="date"
                id="dataEnvio"
                name="dataEnvio"
                value={formData.dataEnvio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {formData.tipoMovimento === 'recebido' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="remetente" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Remetente *
              </label>
              <input
                type="text"
                id="remetente"
                name="remetente"
                value={formData.remetente}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${errors.remetente ? 'border-red-300 dark:border-red-700' : 'border-gray-300 dark:border-gray-600'} px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm`}
                placeholder="Nome do remetente"
                disabled={loading}
              />
              {errors.remetente && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.remetente}</p>
              )}
            </div>
            <div>
              <label htmlFor="dataRecebimento" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Data de Recebimento
              </label>
              <input
                type="date"
                id="dataRecebimento"
                name="dataRecebimento"
                value={formData.dataRecebimento}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {formData.tipoMovimento === 'interno' && (
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Responsável
            </label>
            <input
              type="text"
              id="responsavel"
              name="responsavel"
              value={formData.responsavel}
              readOnly
              disabled
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed sm:text-sm"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Preenchido automaticamente com o utilizador autenticado.
            </p>
          </div>
        )}

        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm"
            placeholder="Descrição opcional do documento"
            disabled={loading}
          />
        </div>

        {/* Upload de Arquivo - Apenas na criação */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Arquivo *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`mt-1 flex justify-center px-6 py-10 border-2 border-dashed rounded-md ${
                dragActive ? 'border-green-400 dark:border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600'
              } ${errors.arquivo ? 'border-red-300 dark:border-red-700' : ''}`}
            >
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{formatFileSize(selectedFile.size)}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="mt-2 text-sm text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <div className="flex text-sm text-gray-600 dark:text-gray-400">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white dark:bg-gray-800 font-medium text-green-600 dark:text-green-400 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-green-500 dark:hover:text-green-300"
                      >
                        <span>Faça upload de um arquivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.txt,.csv,.rtf,.zip,.rar,.mp4,.webm,.mov,.avi,.wmv"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          disabled={loading}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT, ZIP, RAR, etc. até 500MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {errors.arquivo && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.arquivo}</p>
            )}
          </div>
        )}

        {/* Status - apenas na edição (na criação o documento é sempre ativo) */}
        {isEditing && (
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 px-3 py-2 shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:border-green-500 dark:focus:border-green-400 focus:outline-none focus:ring-green-500 sm:text-sm"
              disabled={loading}
            >
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>
        )}

        {/* Progress bar de upload */}
        {uploadProgress !== null && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>A enviar ficheiro...</span>
              <span>{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading
              ? uploadProgress !== null
                ? `A enviar... ${uploadProgress}%`
                : 'Salvando...'
              : isEditing ? 'Atualizar' : 'Criar'
            }
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default DocumentoForm;
