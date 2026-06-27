// Service de Documentos - Implementação completa baseada no FRONTEND_REQUIREMENTS.md

import {
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  API_BASE_URL,
  refreshAccessToken,
  ApiResponse,
  ApiPaginatedResponse
} from '@/lib/api';
import { 
  Documento
} from '@/types';

export interface DocumentoQueryParams {
  q?: string;
  departamento?: string;
  categoria?: string;
  tipo?: string;
  tipoMovimento?: 'enviado' | 'recebido' | 'interno';
  status?: 'ativo' | 'arquivado';
  dataInicio?: string;
  dataFim?: string;
  dataEmissaoInicio?: string;
  dataEmissaoFim?: string;
  ativo?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DocumentoCreateData {
  titulo: string;
  descricao?: string;
  categoria: string;
  tipo?: string; // OPCIONAL - algumas categorias não têm tipos específicos
  departamento: string;
  usuario?: string;
  tipoMovimento: 'enviado' | 'recebido' | 'interno';
  remetente?: string;
  destinatario?: string;
  responsavel?: string;
  dataEnvio?: string;
  dataRecebimento?: string;
  tags?: string[];
  arquivo: File;
}

export interface DocumentoUpdateData {
  titulo?: string;
  descricao?: string;
  categoria?: string;
  tipo?: string;
  departamento?: string;
  tipoMovimento?: 'enviado' | 'recebido' | 'interno';
  remetente?: string;
  destinatario?: string;
  dataEnvio?: string;
  dataRecebimento?: string;
  tags?: string[];
  ativo?: boolean;
}

// Faz fetch a um endpoint que devolve { url, ... } (URL assinada para o
// ficheiro, conforme a storageConfig do tenant: local/R2/self-hosted) e
// depois faz fetch a essa URL para obter o conteúdo como Blob. Tenta renovar
// o access token uma vez em caso de 401.
//
// O segundo fetch (à URL assinada) é feito sem credentials: a URL já contém
// o token de autorização, e para destinos cross-origin (R2/self-hosted) o
// CORS dessas origens não inclui Access-Control-Allow-Credentials — um fetch
// com credentials: 'include' que seguisse um redirect cross-origin para lá
// falharia com "Failed to fetch".
async function fetchFileBlob(jsonUrl: string, errorPrefix: string): Promise<{ blob: Blob; data: any }> {
  let response = await fetch(jsonUrl, { credentials: 'include' });

  if (response.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      response = await fetch(jsonUrl, { credentials: 'include' });
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
    }
  }

  if (!response.ok) {
    let message = `${errorPrefix}: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.message) message = data.message;
    } catch {
      // resposta sem corpo JSON
    }
    throw new Error(message);
  }

  const { data } = await response.json();

  const fileResponse = await fetch(data.url);
  if (!fileResponse.ok) {
    let message = `${errorPrefix}: ${fileResponse.status}`;
    try {
      const errorData = await fileResponse.json();
      if (errorData?.message) message = errorData.message;
      else if (errorData?.error) message = errorData.error;
    } catch {
      // resposta sem corpo JSON (ex.: ficheiro binário)
    }
    throw new Error(message);
  }

  const blob = await fileResponse.blob();
  return { blob, data };
}

export class DocumentosService {
  // Listar todos os documentos (com paginação e filtros)
  static async listar(params?: DocumentoQueryParams): Promise<ApiPaginatedResponse<Documento>> {
    return apiGet<ApiPaginatedResponse<Documento>>('/documentos', params as Record<string, string | number | boolean>);
  }

  // Buscar documento por ID
  static async buscarPorId(id: string): Promise<ApiResponse<Documento>> {
    return apiGet<ApiResponse<Documento>>(`/documentos/${id}`);
  }

  // Criar novo documento
  static async criar(documento: DocumentoCreateData): Promise<ApiResponse<Documento>> {
    console.log('🏗️ DocumentosService.criar chamado com:', documento);
    console.log('👤 Responsável recebido:', documento.responsavel);
    
    const formData = new FormData();
    
    // Adicionar dados do documento
    formData.append('titulo', documento.titulo);
    if (documento.descricao) formData.append('descricao', documento.descricao);
    formData.append('categoria', documento.categoria);
    if (documento.tipo) formData.append('tipo', documento.tipo); // Apenas adicionar se houver tipo
    formData.append('departamento', documento.departamento);
    if (documento.usuario) formData.append('usuario', documento.usuario);
    formData.append('tipoMovimento', documento.tipoMovimento);
    if (documento.remetente) formData.append('remetente', documento.remetente);
    if (documento.destinatario) formData.append('destinatario', documento.destinatario);
    if (documento.responsavel) formData.append('responsavel', documento.responsavel);
    if (documento.dataEnvio) formData.append('dataEnvio', documento.dataEnvio);
    if (documento.dataRecebimento) formData.append('dataRecebimento', documento.dataRecebimento);
    if (documento.tags) formData.append('tags', JSON.stringify(documento.tags));
    
    // Adicionar arquivo
    formData.append('arquivo', documento.arquivo);

    return apiPost<ApiResponse<Documento>>('/documentos', formData);
  }

  // Atualizar documento existente (sem arquivo)
  static async atualizar(id: string, documento: DocumentoUpdateData): Promise<ApiResponse<Documento>> {
    return apiPut<ApiResponse<Documento>>(`/documentos/${id}`, documento as Record<string, unknown>);
  }

  // Remover documento
  static async remover(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiDelete<ApiResponse<{ message: string }>>(`/documentos/${id}`);
  }

  // Buscar documentos por texto (busca em título e descrição)
  static async buscarPorTexto(texto: string, filtros?: Partial<DocumentoQueryParams>): Promise<ApiPaginatedResponse<Documento>> {
    const params: DocumentoQueryParams = {
      q: texto,
      limit: 100,
      ...filtros
    };
    return this.listar(params);
  }

  // Buscar documentos por departamento usando endpoint específico
  static async buscarPorDepartamento(departamentoId: string, params?: DocumentoQueryParams): Promise<ApiPaginatedResponse<Documento>> {
    return apiGet<ApiPaginatedResponse<Documento>>(`/documentos/departamento/${departamentoId}`, params as Record<string, string | number | boolean>);
  }

  // Buscar documentos por categoria
  static async buscarPorCategoria(categoriaId: string, params?: DocumentoQueryParams): Promise<ApiPaginatedResponse<Documento>> {
    return this.listar({
      ...params,
      categoria: categoriaId
    });
  }

  // Buscar documentos por tipo
  static async buscarPorTipo(tipoId: string, params?: DocumentoQueryParams): Promise<ApiPaginatedResponse<Documento>> {
    return this.listar({
      ...params,
      tipo: tipoId
    });
  }

  // Buscar documentos por usuário usando endpoint específico
  static async buscarPorUsuario(usuarioId: string, params?: DocumentoQueryParams): Promise<ApiPaginatedResponse<Documento>> {
    return apiGet<ApiPaginatedResponse<Documento>>(`/documentos/usuario/${usuarioId}`, params as Record<string, string | number | boolean>);
  }

  // Download de documento (anexo) — o backend devolve uma URL assinada para
  // o storage provider configurado no tenant (local/R2/self-hosted).
  static async download(id: string): Promise<Blob> {
    const { blob } = await fetchFileBlob(`${API_BASE_URL}/documentos/${id}/download`, 'Erro no download');
    return blob;
  }

  // Preview de documento (inline) — usado pelo DocumentPreview para
  // visualização sem forçar o download como anexo. `format` reflete o
  // formato a renderizar (pode ser 'pdf' se o backend converteu o ficheiro
  // original via LibreOffice, em tenants self-hosted).
  static async preview(id: string): Promise<{ blob: Blob; format: string }> {
    const { blob, data } = await fetchFileBlob(`${API_BASE_URL}/files/preview/${id}`, 'Erro ao carregar preview');
    return { blob, format: data.format };
  }

  // Obter estatísticas de documentos
  static async obterEstatisticas(): Promise<ApiResponse<{
    total: number;
    porDepartamento: { departamento: string; quantidade: number }[];
    porCategoria: { categoria: string; quantidade: number }[];
    porTipo: { tipo: string; quantidade: number }[];
    recentes: Documento[];
  }>> {
    return apiGet<ApiResponse<any>>('/documentos/estatisticas');
  }

  // Buscar documento por ID (alias para compatibilidade com hooks)
  static async buscar(id: string): Promise<ApiResponse<Documento>> {
    return this.buscarPorId(id);
  }

  // Baixar documento (alias para compatibilidade com hooks)
  static async baixar(id: string): Promise<Blob> {
    return this.download(id);
  }

  // Atualizar status do documento
  static async atualizarStatus(id: string, status: string): Promise<ApiResponse<Documento>> {
    return apiPut<ApiResponse<Documento>>(`/documentos/${id}/status`, { status });
  }
}
