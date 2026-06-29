import { useState, useCallback } from 'react';
import { 
  UsuariosService
} from '@/services/usuariosService';
import { 
  Usuario, 
  UsuarioCreateData, 
  UsuarioUpdateData, 
  UsuarioQueryParams 
} from '@/types';
import { useToastContext } from '@/contexts/ToastContext';

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { success, error: showError } = useToastContext();

  // Carregar lista de usuários
  const carregar = useCallback(async (params?: UsuarioQueryParams) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.listar(params);
      setUsuarios(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar utilizadores';
      setError(errorMessage);
      showError('Erro ao carregar utilizadores', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Buscar por ID
  const buscarPorId = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.buscarPorId(id);
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar utilizador';
      setError(errorMessage);
      showError('Erro ao buscar utilizador', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Criar novo usuário
  const criar = useCallback(async (data: UsuarioCreateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.criar(data);
      success('Utilizador criado com sucesso');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar utilizador';
      setError(errorMessage);
      showError('Não foi possível criar o utilizador', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Atualizar usuário
  const atualizar = useCallback(async (id: string, data: UsuarioUpdateData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.atualizar(id, data);
      success('Utilizador atualizado com sucesso');
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar utilizador';
      setError(errorMessage);
      showError('Não foi possível atualizar', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Remover usuário
  const remover = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await UsuariosService.remover(id);
      success('Utilizador removido com sucesso');
      // Atualizar lista local
      setUsuarios(prev => prev.filter(user => user._id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover utilizador';
      setError(errorMessage);
      showError('Não foi possível remover o utilizador', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [success, showError]);

  // Buscar por texto
  const buscarPorTexto = useCallback(async (texto: string, ativo?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const filtros = ativo !== undefined ? { ativo } : undefined;
      const response = await UsuariosService.buscarPorTexto(texto, filtros);
      setUsuarios(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao pesquisar utilizadores';
      setError(errorMessage);
      showError('Erro na pesquisa', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Carregar apenas ativos (para selects)
  const carregarAtivos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await UsuariosService.listarAtivos();
      return response.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar utilizadores';
      setError(errorMessage);
      showError('Erro ao carregar utilizadores', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Buscar por role
  const buscarPorRole = useCallback(async (role: 'admin' | 'manager' | 'user', ativo?: boolean) => {
    try {
      setLoading(true);
      setError(null);
      const filtros = ativo !== undefined ? { ativo } : undefined;
      const response = await UsuariosService.buscarPorRole(role, filtros);
      setUsuarios(response.data);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao filtrar utilizadores';
      setError(errorMessage);
      showError('Erro ao filtrar utilizadores', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Carregar com paginação (compatível com usePaginatedData)
  const carregarPaginado = useCallback(async (params: {
    page?: number;
    limit?: number;
    q?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams: UsuarioQueryParams = {
        page: params.page || 1,
        limit: params.limit || 10,
        ...(params.q && { q: params.q }),
        ...(params.sortBy && { 
          sortBy: params.sortBy,
          sortOrder: params.sortOrder || 'asc'
        })
      };
      
      const response = await UsuariosService.listar(queryParams);
      
      // O backend retorna: { success: true, data: [...], page, limit, total }
      return {
        data: response.data,
        total: response.total || 0,
        page: response.page || params.page || 1,
        totalPages: Math.ceil((response.total || 0) / (params.limit || 10))
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar utilizadores';
      setError(errorMessage);
      showError('Erro ao carregar utilizadores', errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [showError]);

  // Verificar se username já existe
  const verificarUsername = useCallback(async (username: string, userId?: string) => {
    try {
      const response = await UsuariosService.buscarPorTexto(username);
      return response.data.some((usuario: Usuario) => 
        usuario.username === username && usuario._id !== userId
      );
    } catch {
      return false;
    }
  }, []);

  // Obter usuários para select
  const obterParaSelect = useCallback(async () => {
    try {
      return await UsuariosService.obterParaSelect();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar utilizadores';
      showError('Erro ao carregar utilizadores', errorMessage);
      return [];
    }
  }, [showError]);

  return {
    usuarios,
    loading,
    error,
    carregar,
    carregarPaginado,
    buscarPorId,
    criar,
    atualizar,
    remover,
    buscarPorTexto,
    carregarAtivos,
    buscarPorRole,
    verificarUsername,
    obterParaSelect,
  };
};
