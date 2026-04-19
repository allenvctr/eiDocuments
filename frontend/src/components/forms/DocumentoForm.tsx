"use client";

import React, { useState, useEffect } from 'react';
import FormModal from '@/components/ui/FormModal';
import { CreateDocumento, UpdateDocumento, Documento } from '@/types';
import { useDocumentos } from '@/hooks/useDocumentos';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useCategorias } from '@/hooks/useCategorias';
import { useTipos } from '@/hooks/useTipos';
import { useAuth } from '@/hooks/useAuth';
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
  const { carregarAtivosPorDepartamento } = useTipos();
  const { user, isAdmin } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const [departamentos, setDepartamentos] = useState<{ value: string; label: string }[]>([]);
  const [categorias, setCategorias] = useState<{ value: string; label: string }[]>([]);
  const [tiposDoDepartamento, setTiposDoDepartamento] = useState<any[]>([]);
  const [tiposFiltrados, setTiposFiltrados] = useState<any[]>([]);
  
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
    dataEnvio: '',
    dataRecebimento: '',
    tags: [],
    status: 'ativo',
    ativo: true
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
          dataEnvio: formatDateForInput(documento.dataEnvio),
          dataRecebimento: formatDateForInput(documento.dataRecebimento),
          tags: documento.tags || [],
          status: documento.status,
          ativo: documento.ativo
        });
        setSelectedFile(null); // Não permite alterar arquivo na edição
      } else {
        // Modo criação - limpar formulário
        // Para editores, manter o departamento pré-selecionado
        setFormData({
          titulo: '',
          descricao: '',
          categoria: '',
          tipo: '',
          departamento: !isAdmin() && user?.departamento?._id ? user.departamento._id : '',
          tipoMovimento: 'interno',
          remetente: '',
          destinatario: '',
          responsavel: '',
          dataEnvio: '',
          dataRecebimento: '',
          tags: [],
          status: 'ativo',
          ativo: true
        });
        setSelectedFile(null);
        
        // Para editores, carregar categorias do departamento
        if (!isAdmin() && user?.departamento?._id) {
          loadCategorias(user.departamento!._id);
        }
      }
      setErrors({});
    }
  }, [isOpen, documento]);

  const loadSelectData = async () => {
    try {
      const depsData = isAdmin() 
        ? await obterDepartamentos() 
        : user?.departamento?._id 
          ? [{ value: user.departamento!._id, label: user.departamento!.nome || 'Meu Departamento' }]
          : [];
      
      setDepartamentos(depsData);
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
      
      // Carregar tipos desse departamento passando as categorias
      await loadTiposDoDepartamento(departamentoId, categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      setCategorias([]);
    }
  };

  const loadTiposDoDepartamento = async (departamentoId: string, categoriasData?: { value: string; label: string }[]) => {
    try {
      console.log('📄 DocumentoForm - Carregando tipos do departamento:', departamentoId);
      
      // Carregar tipos ativos do departamento
      const tiposData = await carregarAtivosPorDepartamento(departamentoId);
      console.log('📦 DocumentoForm - Tipos recebidos:', tiposData.length);
      
      // Usar categorias passadas ou do estado
      const cats = categoriasData || categorias;
      console.log('📋 DocumentoForm - Categorias para filtrar:', cats.length);
      
      // Filtrar apenas tipos que pertencem às categorias do departamento
      const categoriasIds = cats.map(cat => cat.value);
      const tiposFiltradosPorDept = tiposData.filter((tipo: any) => {
        const categoriaId = typeof tipo.categoria === 'string' ? tipo.categoria : tipo.categoria?._id;
        return categoriasIds.includes(categoriaId);
      });
      
      console.log('✅ DocumentoForm - Tipos filtrados:', tiposFiltradosPorDept.length);
      setTiposDoDepartamento(tiposFiltradosPorDept);
    } catch (error) {
      console.error('❌ DocumentoForm - Erro ao carregar tipos:', error);
      setTiposDoDepartamento([]);
    }
  };

  // Filtrar tipos por categoria selecionada
  useEffect(() => {
    if (!formData.categoria) {
      setTiposFiltrados([]);
      return;
    }

    const filtrados = tiposDoDepartamento.filter((tipo: any) => {
      // Se tipo.categoria é string (ID)
      if (typeof tipo.categoria === 'string') {
        return tipo.categoria === formData.categoria;
      }
      // Se tipo.categoria é objeto populado
      return tipo.categoria?._id === formData.categoria;
    });

    setTiposFiltrados(filtrados);

    // Se o tipo selecionado não pertence à categoria, limpar
    if (formData.tipo) {
      const tipoValido = filtrados.find((t: any) => t._id === formData.tipo);
      if (!tipoValido) {
        setFormData(prev => ({ ...prev, tipo: '' }));
      }
    }
  }, [formData.categoria, tiposDoDepartamento, formData.tipo]);

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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    setFormData(prev => ({ ...prev, tags: tagsArray }));
  };

  const handleFileSelect = (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (file.size > maxSize) {
      setErrors(prev => ({ ...prev, arquivo: 'Arquivo muito grande. Tamanho máximo: 50MB' }));
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
    } else if (formData.tipoMovimento === 'interno') {
      if (!formData.responsavel?.trim()) {
        newErrors.responsavel = 'Responsável é obrigatório para documentos internos';
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
          // Converter datas para formato ISO se preenchidas
          dataEnvio: formData.dataEnvio ? new Date(formData.dataEnvio + 'T00:00:00').toISOString() : undefined,
          dataRecebimento: formData.dataRecebimento ? new Date(formData.dataRecebimento + 'T00:00:00').toISOString() : undefined,
          tags: formData.tags,
          status: formData.status,
          ativo: formData.ativo
        };

        // Remover campos undefined
        Object.keys(updateData).forEach(key => {
          if (updateData[key as keyof typeof updateData] === undefined) {
            delete updateData[key as keyof typeof updateData];
          }
        });

        await atualizar(documento._id, updateData);
      } else {
        // Para criação, precisamos incluir o arquivo
        const documentoData = {
          ...formData,
          // Converter datas para formato ISO se preenchidas
          dataEnvio: formData.dataEnvio ? new Date(formData.dataEnvio + 'T00:00:00').toISOString() : undefined,
          dataRecebimento: formData.dataRecebimento ? new Date(formData.dataRecebimento + 'T00:00:00').toISOString() : undefined,
          arquivo: selectedFile!
        };
        await criar(documentoData as any);
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar documento:', error);
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
        {/* Título */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-medium text-gray-700">
            Título *
          </label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={formData.titulo}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.titulo ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
            placeholder="Digite o título do documento"
            disabled={loading}
          />
          {errors.titulo && (
            <p className="mt-1 text-sm text-red-600">{errors.titulo}</p>
          )}
        </div>

        {/* Linha 1: Departamento, Categoria, Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Departamento */}
          <div>
            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
              Departamento *
            </label>
            <select
              id="departamento"
              name="departamento"
              value={formData.departamento}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.departamento ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm ${!isAdmin() ? 'bg-gray-50' : ''}`}
              disabled={loading || !isAdmin()}
            >
              <option value="">Selecione um departamento</option>
              {departamentos.map(dept => (
                <option key={dept.value} value={dept.value}>
                  {dept.label}
                </option>
              ))}
            </select>
            {!isAdmin() && (
              <p className="mt-1 text-xs text-gray-500">Seu departamento (não editável)</p>
            )}
            {errors.departamento && (
              <p className="mt-1 text-sm text-red-600">{errors.departamento}</p>
            )}
          </div>

          {/* Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700">
              Categoria *
            </label>
            <select
              id="categoria"
              name="categoria"
              value={formData.categoria}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.categoria ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
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
              <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
              Tipo <span className="text-gray-400 text-xs">(opcional)</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.tipo ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
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
                <option key={tipo._id} value={tipo._id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
            {formData.categoria && tiposFiltrados.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                Esta categoria não possui tipos específicos cadastrados.
              </p>
            )}
            {errors.tipo && (
              <p className="mt-1 text-sm text-red-600">{errors.tipo}</p>
            )}
          </div>
        </div>

        {/* Tipo de Movimento */}
        <div>
          <label htmlFor="tipoMovimento" className="block text-sm font-medium text-gray-700">
            Tipo de Movimento *
          </label>
          <select
            id="tipoMovimento"
            name="tipoMovimento"
            value={formData.tipoMovimento}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            disabled={loading}
          >
            <option value="interno">Interno</option>
            <option value="enviado">Enviado</option>
            <option value="recebido">Recebido</option>
          </select>
        </div>

        {/* Campos condicionais por tipo de movimento */}
        {formData.tipoMovimento === 'enviado' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="destinatario" className="block text-sm font-medium text-gray-700">
                Destinatário *
              </label>
              <input
                type="text"
                id="destinatario"
                name="destinatario"
                value={formData.destinatario}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${errors.destinatario ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                placeholder="Nome do destinatário"
                disabled={loading}
              />
              {errors.destinatario && (
                <p className="mt-1 text-sm text-red-600">{errors.destinatario}</p>
              )}
            </div>
            <div>
              <label htmlFor="dataEnvio" className="block text-sm font-medium text-gray-700">
                Data de Envio
              </label>
              <input
                type="date"
                id="dataEnvio"
                name="dataEnvio"
                value={formData.dataEnvio}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {formData.tipoMovimento === 'recebido' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="remetente" className="block text-sm font-medium text-gray-700">
                Remetente *
              </label>
              <input
                type="text"
                id="remetente"
                name="remetente"
                value={formData.remetente}
                onChange={handleInputChange}
                className={`mt-1 block w-full rounded-md border ${errors.remetente ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
                placeholder="Nome do remetente"
                disabled={loading}
              />
              {errors.remetente && (
                <p className="mt-1 text-sm text-red-600">{errors.remetente}</p>
              )}
            </div>
            <div>
              <label htmlFor="dataRecebimento" className="block text-sm font-medium text-gray-700">
                Data de Recebimento
              </label>
              <input
                type="date"
                id="dataRecebimento"
                name="dataRecebimento"
                value={formData.dataRecebimento}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                disabled={loading}
              />
            </div>
          </div>
        )}

        {formData.tipoMovimento === 'interno' && (
          <div>
            <label htmlFor="responsavel" className="block text-sm font-medium text-gray-700">
              Responsável *
            </label>
            <input
              type="text"
              id="responsavel"
              name="responsavel"
              value={formData.responsavel}
              onChange={handleInputChange}
              className={`mt-1 block w-full rounded-md border ${errors.responsavel ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
              placeholder="Nome do responsável pelo documento"
              disabled={loading}
            />
            {errors.responsavel && (
              <p className="mt-1 text-sm text-red-600">{errors.responsavel}</p>
            )}
          </div>
        )}

        {/* Descrição */}
        <div>
          <label htmlFor="descricao" className="block text-sm font-medium text-gray-700">
            Descrição
          </label>
          <textarea
            id="descricao"
            name="descricao"
            value={formData.descricao}
            onChange={handleInputChange}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="Descrição opcional do documento"
            disabled={loading}
          />
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={(formData.tags || []).join(', ')}
            onChange={handleTagsChange}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
            placeholder="Digite as tags separadas por vírgula"
            disabled={loading}
          />
          <p className="mt-1 text-sm text-gray-500">
            Separe as tags com vírgulas (ex: relatório, mensal, financeiro)
          </p>
        </div>

        {/* Upload de Arquivo - Apenas na criação */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Arquivo *
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`mt-1 flex justify-center px-6 py-10 border-2 border-dashed rounded-md ${
                dragActive ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300'
              } ${errors.arquivo ? 'border-red-300' : ''}`}
            >
              <div className="space-y-1 text-center">
                {selectedFile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <FileText className="w-8 h-8 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                      <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        Remover arquivo
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 hover:text-indigo-500"
                      >
                        <span>Faça upload de um arquivo</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.txt"
                          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                          disabled={loading}
                        />
                      </label>
                      <p className="pl-1">ou arraste e solte</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF, TXT até 50MB
                    </p>
                  </>
                )}
              </div>
            </div>
            {errors.arquivo && (
              <p className="mt-1 text-sm text-red-600">{errors.arquivo}</p>
            )}
          </div>
        )}

        {/* Status e Ativo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              disabled={loading}
            >
              <option value="ativo">Ativo</option>
              <option value="arquivado">Arquivado</option>
            </select>
          </div>

          <div className="flex items-center justify-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                name="ativo"
                checked={formData.ativo}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                disabled={loading}
              />
              <span className="ml-2 text-sm font-medium text-gray-700">
                Documento ativo
              </span>
            </label>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default DocumentoForm;
