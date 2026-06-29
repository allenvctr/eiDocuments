"use client";

import React, { useState, useEffect } from 'react';
import { Save, FileText, Upload } from 'lucide-react';
import FormModal from '@/components/ui/FormModal';
import { useAuth } from '@/hooks/useAuth';
import { Documento } from '@/types';

interface DocumentoEditModalProps {
  documento: Documento | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (documento: Documento, formData: DocumentoEditData) => Promise<void>;
}

export interface DocumentoEditData {
  titulo: string;
  descricao: string;
  categoria: string;
  tipo: string;
  tipoMovimento: 'enviado' | 'recebido' | 'interno';
  remetente: string;
  destinatario: string;
  responsavel: string;
  dataEnvio: string;
  dataRecebimento: string;
  status: string;
  novoArquivo?: File;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:border-transparent transition-colors';

const DocumentoEditModal: React.FC<DocumentoEditModalProps> = ({
  documento,
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<DocumentoEditData>({
    titulo: '',
    descricao: '',
    categoria: '',
    tipo: '',
    tipoMovimento: 'interno',
    remetente: '',
    destinatario: '',
    responsavel: '',
    dataEnvio: '',
    dataRecebimento: '',
    status: 'ativo',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documento) {
      setFormData({
        titulo: documento.titulo || '',
        descricao: documento.descricao || '',
        categoria: typeof documento.categoria === 'object' ? documento.categoria.nome : documento.categoria || '',
        tipo: typeof documento.tipo === 'object' ? documento.tipo?.nome || '' : documento.tipo || '',
        tipoMovimento: documento.tipoMovimento || 'interno',
        remetente: documento.remetente || '',
        destinatario: documento.destinatario || '',
        responsavel: documento.responsavel || '',
        dataEnvio: documento.dataEnvio ? documento.dataEnvio.split('T')[0] : '',
        dataRecebimento: documento.dataRecebimento
          ? documento.dataRecebimento.split('T')[0]
          : '',
        status: documento.status || 'ativo',
      });
      setError(null);
    }
  }, [documento]);

  // Para documentos internos, o responsável é sempre o utilizador autenticado
  useEffect(() => {
    if (formData.tipoMovimento === 'interno' && user?.nome && formData.responsavel !== user.nome) {
      setFormData(prev => ({ ...prev, responsavel: user.nome }));
    }
  }, [formData.tipoMovimento, formData.responsavel, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setFormData((prev) => ({ ...prev, novoArquivo: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento) return;

    if (!formData.titulo.trim()) { setError('Título é obrigatório'); return; }
    if (!formData.categoria.trim()) { setError('Categoria é obrigatória'); return; }
    if (!formData.tipo.trim()) { setError('Tipo é obrigatório'); return; }

    setError(null);
    setLoading(true);
    try {
      await onSave(documento, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar documento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!documento) return null;

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Editar Documento"
      size="xl"
    >
      <form id="documento-edit-form" onSubmit={handleSubmit} className="space-y-0">
        {/* Sub-header informativo */}
        <div className="flex items-center gap-3 p-4 mb-5 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <div className="w-9 h-9 flex-shrink-0 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-green-900 dark:text-green-200 truncate">{documento.titulo}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Editando metadados do documento</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Coluna esquerda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Título <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <input
                type="text"
                name="titulo"
                value={formData.titulo}
                onChange={handleInputChange}
                className={inputClass}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Descrição
              </label>
              <textarea
                name="descricao"
                value={formData.descricao}
                onChange={handleInputChange}
                rows={3}
                className={`${inputClass} resize-none`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Categoria <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Tipo <span className="text-red-500 dark:text-red-400">*</span>
                </label>
                <input
                  type="text"
                  name="tipo"
                  value={formData.tipo}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Tipo de Movimento <span className="text-red-500 dark:text-red-400">*</span>
              </label>
              <select
                name="tipoMovimento"
                value={formData.tipoMovimento}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="recebido">Recebido</option>
                <option value="enviado">Enviado</option>
                <option value="interno">Interno</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={inputClass}
              >
                <option value="ativo">Ativo</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="space-y-4">
            {formData.tipoMovimento === 'recebido' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Remetente
                </label>
                <input
                  type="text"
                  name="remetente"
                  value={formData.remetente}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            )}
            {formData.tipoMovimento === 'enviado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Destinatário
                </label>
                <input
                  type="text"
                  name="destinatario"
                  value={formData.destinatario}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            )}
            {formData.tipoMovimento === 'interno' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Responsável
                </label>
                <input
                  type="text"
                  name="responsavel"
                  value={formData.responsavel}
                  readOnly
                  disabled
                  className={`${inputClass} bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed`}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Preenchido automaticamente com o utilizador autenticado.
                </p>
              </div>
            )}
            {formData.tipoMovimento === 'enviado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Data de Envio
                </label>
                <input
                  type="date"
                  name="dataEnvio"
                  value={formData.dataEnvio}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            )}
            {formData.tipoMovimento === 'recebido' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Data de Recebimento
                </label>
                <input
                  type="date"
                  name="dataRecebimento"
                  value={formData.dataRecebimento}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Substituir Arquivo{' '}
                <span className="text-gray-400 dark:text-gray-500 font-normal text-xs">(opcional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 hover:border-green-400 dark:hover:border-green-500 transition-colors text-center">
                <Upload className="mx-auto h-7 w-7 text-gray-400 dark:text-gray-500 mb-1.5" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Clique para selecionar um novo arquivo</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="novo-arquivo"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="novo-arquivo"
                  className="cursor-pointer inline-flex px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Escolher Arquivo
                </label>
                {formData.novoArquivo && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                    Selecionado: {formData.novoArquivo.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botões dentro do form (necessário para submit) */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Salvar Alterações
              </>
            )}
          </button>
        </div>
      </form>
    </FormModal>
  );
};

export default DocumentoEditModal;
