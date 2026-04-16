"use client";

import React, { useState, useEffect } from 'react';
import { Save, FileText, Upload } from 'lucide-react';
import FormModal from '@/components/ui/FormModal';
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
  tags: string[];
  status: string;
  novoArquivo?: File;
}

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';

const DocumentoEditModal: React.FC<DocumentoEditModalProps> = ({
  documento,
  isOpen,
  onClose,
  onSave,
}) => {
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
    tags: [],
    status: 'ativo',
  });
  const [loading, setLoading] = useState(false);
  const [tagsInput, setTagsInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (documento) {
      setFormData({
        titulo: documento.titulo || '',
        descricao: documento.descricao || '',
        categoria: documento.categoria?.nome || '',
        tipo: documento.tipo?.nome || '',
        tipoMovimento: documento.tipoMovimento || 'interno',
        remetente: documento.remetente || '',
        destinatario: documento.destinatario || '',
        responsavel: documento.responsavel || '',
        dataEnvio: documento.dataEnvio ? documento.dataEnvio.split('T')[0] : '',
        dataRecebimento: documento.dataRecebimento
          ? documento.dataRecebimento.split('T')[0]
          : '',
        tags: documento.tags || [],
        status: documento.status || 'ativo',
      });
      setTagsInput((documento.tags || []).join(', '));
      setError(null);
    }
  }, [documento]);

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

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagsInput(value);
    setFormData((prev) => ({
      ...prev,
      tags: value
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documento) return;

    if (!formData.titulo.trim()) { setError('Título é obrigatório'); return; }
    if (!formData.categoria.trim()) { setError('Categoria é obrigatória'); return; }
    if (!formData.tipo.trim()) { setError('Tipo é obrigatório'); return; }
    if (formData.tipoMovimento === 'interno' && !formData.responsavel.trim()) {
      setError('Responsável é obrigatório para documentos internos');
      return;
    }

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
        <div className="flex items-center gap-3 p-4 mb-5 bg-blue-50 rounded-lg">
          <div className="w-9 h-9 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-blue-900 truncate">{documento.titulo}</p>
            <p className="text-xs text-blue-600">Editando metadados do documento</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Coluna esquerda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Título <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Categoria <span className="text-red-500">*</span>
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Tipo <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tipo de Movimento <span className="text-red-500">*</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                <option value="rascunho">Rascunho</option>
              </select>
            </div>
          </div>

          {/* Coluna direita */}
          <div className="space-y-4">
            {formData.tipoMovimento === 'recebido' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Responsável <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="responsavel"
                  value={formData.responsavel}
                  onChange={handleInputChange}
                  className={inputClass}
                  required
                />
              </div>
            )}
            {formData.tipoMovimento === 'enviado' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Tags <span className="text-gray-400 font-normal text-xs">(separadas por vírgula)</span>
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={handleTagsChange}
                placeholder="urgente, relatório, mensal"
                className={inputClass}
              />
              {formData.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Substituir Arquivo{' '}
                <span className="text-gray-400 font-normal text-xs">(opcional)</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-400 transition-colors text-center">
                <Upload className="mx-auto h-7 w-7 text-gray-400 mb-1.5" />
                <p className="text-sm text-gray-500 mb-2">Clique para selecionar um novo arquivo</p>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  id="novo-arquivo"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="novo-arquivo"
                  className="cursor-pointer inline-flex px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Escolher Arquivo
                </label>
                {formData.novoArquivo && (
                  <p className="mt-2 text-xs text-gray-600">
                    Selecionado: {formData.novoArquivo.name}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botões dentro do form (necessário para submit) */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-5 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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
