"use client";

import React, { useState, useEffect } from 'react';
import { CreateTipoDocumento, UpdateTipoDocumento, TipoDocumento, CategoriaDocumento } from '@/types';
import { useTipos } from '@/hooks/useTipos';
import { useCategorias } from '@/hooks/useCategorias';
import { useDepartamentos } from '@/hooks/useDepartamentos';
import { useAuth } from '@/hooks/useAuth';

interface TipoFormProps {
  tipo?: TipoDocumento | null;
  onSuccess?: () => void;
}

const TipoForm: React.FC<TipoFormProps> = ({
  tipo,
  onSuccess
}) => {
  const { criar, atualizar, verificarCodigo } = useTipos();
  const { categorias, loading: loadingCategorias, carregar: carregarCategorias, carregarPorDepartamento } = useCategorias();
  const { departamentos, carregar: carregarDepartamentos } = useDepartamentos();
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedDepartamento, setSelectedDepartamento] = useState<string>('');
  
  const [formData, setFormData] = useState<CreateTipoDocumento>({
    nome: '',
    codigo: '',
    descricao: '',
    categoria: '',
    ativo: true
  });

  const isEditing = !!tipo;

  // Carregar departamentos e categorias ao montar o componente
  useEffect(() => {
    const loadInitialData = async () => {
      if (isAdmin()) {
        // Admin pode escolher departamento, então carrega todos os departamentos
        await carregarDepartamentos();
        // Carrega todas as categorias inicialmente
        carregarCategorias({ ativo: true });
      } else if (user?.departamento?._id) {
        // Editor/User vê apenas categorias do seu departamento
        await carregarPorDepartamento(user.departamento!._id, true);
      }
    };
    
    loadInitialData();
  }, [isAdmin, user, carregarCategorias, carregarPorDepartamento, carregarDepartamentos]);

  // Quando admin seleciona um departamento, carregar categorias desse departamento
  useEffect(() => {
    const loadCategoriasPorDept = async () => {
      if (isAdmin() && selectedDepartamento) {
        await carregarPorDepartamento(selectedDepartamento, true);
        // Limpar categoria selecionada quando departamento muda
        setFormData(prev => ({ ...prev, categoria: '' }));
      }
    };
    
    loadCategoriasPorDept();
  }, [selectedDepartamento, isAdmin, carregarPorDepartamento]);

  useEffect(() => {
    if (tipo) {
      // Modo edição - preencher formulário
      // Remover prefixo do departamento do código (se existir)
      let codigoSemPrefixo = tipo.codigo;
      if (tipo.codigo.includes('-')) {
        const partes = tipo.codigo.split('-');
        // Remove a primeira parte (prefixo do departamento)
        codigoSemPrefixo = partes.slice(1).join('-');
      }
      
      setFormData({
        nome: tipo.nome,
        codigo: codigoSemPrefixo,
        descricao: tipo.descricao || '',
        categoria: typeof tipo.categoria === 'string' ? tipo.categoria : tipo.categoria._id,
        ativo: tipo.ativo
      });
    } else {
      // Modo criação - limpar formulário
      setFormData({
        nome: '',
        codigo: '',
        descricao: '',
        categoria: '',
        ativo: true
      });
    }
    setErrors({});
  }, [tipo]);

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.codigo.trim()) {
      newErrors.codigo = 'Código é obrigatório';
    }

    if (!formData.categoria) {
      newErrors.categoria = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const checkCodigoExists = async (codigo: string): Promise<boolean> => {
    if (!codigo.trim()) return false;
    
    try {
      const exists = await verificarCodigo(codigo, tipo?._id);
      return exists;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Verificar se código já existe
    const codigoExists = await checkCodigoExists(formData.codigo);
    if (codigoExists) {
      setErrors(prev => ({ ...prev, codigo: 'Este código já está em uso' }));
      return;
    }

    try {
      setLoading(true);
      
      if (isEditing) {
        await atualizar(tipo._id, formData as UpdateTipoDocumento);
      } else {
        await criar(formData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Erro ao salvar tipo:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
        {/* Departamento (apenas para Admin) */}
        {isAdmin() && (
          <div>
            <label htmlFor="departamento" className="block text-sm font-medium text-gray-700">
              Departamento *
            </label>
            <select
              id="departamento"
              value={selectedDepartamento}
              onChange={(e) => setSelectedDepartamento(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
              disabled={loading || isEditing}
            >
              <option value="">Selecione um departamento</option>
              {departamentos.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.nome} ({dept.codigo})
                </option>
              ))}
            </select>
            {!selectedDepartamento && (
              <p className="mt-1 text-sm text-blue-600">
                ℹ️ Selecione um departamento para filtrar as categorias
              </p>
            )}
          </div>
        )}

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
            disabled={loading || loadingCategorias || (isAdmin() && !selectedDepartamento)}
          >
            <option value="">
              {isAdmin() && !selectedDepartamento 
                ? 'Selecione um departamento primeiro' 
                : 'Selecione uma categoria'}
            </option>
            {categorias.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.nome} ({cat.codigo})
              </option>
            ))}
          </select>
          {errors.categoria && (
            <p className="mt-1 text-sm text-red-600">{errors.categoria}</p>
          )}
          {categorias.length === 0 && !loadingCategorias && selectedDepartamento && (
            <p className="mt-1 text-sm text-amber-600">
              ⚠️ Nenhuma categoria disponível neste departamento. Crie uma categoria primeiro.
            </p>
          )}
        </div>

        {/* Nome */}
        <div>
          <label htmlFor="nome" className="block text-sm font-medium text-gray-700">
            Nome *
          </label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.nome ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
            placeholder="Digite o nome do tipo"
            disabled={loading}
          />
          {errors.nome && (
            <p className="mt-1 text-sm text-red-600">{errors.nome}</p>
          )}
        </div>

        {/* Código */}
        <div>
          <label htmlFor="codigo" className="block text-sm font-medium text-gray-700">
            Código *
          </label>
          <input
            type="text"
            id="codigo"
            name="codigo"
            value={formData.codigo}
            onChange={handleInputChange}
            className={`mt-1 block w-full rounded-md border ${errors.codigo ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm`}
            placeholder="pdf_doc"
            disabled={loading}
          />
          {errors.codigo && (
            <p className="mt-1 text-sm text-red-600">{errors.codigo}</p>
          )}
          <p className="mt-1 text-sm text-blue-600">
            ℹ️ O código do departamento será adicionado automaticamente como prefixo (ex: DTL-pdf_doc)
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Use apenas letras, números, hífen ou underscore
          </p>
        </div>

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
            placeholder="Descrição opcional do tipo de documento"
            disabled={loading}
          />
        </div>

        {/* Ativo */}
        <div>
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
              Tipo ativo
            </span>
          </label>
          <p className="mt-1 text-sm text-gray-500">
            Tipos inativos não aparecerão nas opções de seleção
          </p>
        </div>

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'}
          </button>
        </div>
      </form>
  );
};

export default TipoForm;
