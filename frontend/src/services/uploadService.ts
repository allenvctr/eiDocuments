// Service para upload de documentos com criação automática de categorias e tipos
import { apiPost, apiGet, ApiResponse, API_BASE_URL } from '@/lib/api';
import { DocumentosService, DocumentoCreateData } from './documentosService';

interface CategoriaRequest {
  nome: string;
  codigo: string;
  descricao: string;
  departamento: string;
}

interface TipoRequest {
  nome: string;
  codigo: string;
  descricao: string;
}

export class UploadService {
  // Função para remover acentos e caracteres especiais
  private static normalizeString(str: string): string {
    return str
      .normalize('NFD') // Decompor caracteres acentuados
      .replace(/[\u0300-\u036f]/g, '') // Remover marcas diacríticas (acentos)
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, '') // Remove caracteres especiais exceto espaços
      .replace(/\s+/g, '_') // Substitui espaços por underscore
      .substring(0, 20);
  }
  // Buscar ou criar categoria
  static async buscarOuCriarCategoria(nome: string, departamentoId: string): Promise<string> {
    try {
      const response = await apiGet<{ success: boolean; data: any[] }>('/categorias', {
        q: nome,
        departamento: departamentoId
      });

      if (response.data && response.data.length > 0) {
        const categoria = response.data.find(cat =>
          cat.nome.toLowerCase() === nome.toLowerCase()
        );
        if (categoria) return categoria._id;
      }

      const codigo = this.normalizeString(nome);

      if (!codigo || codigo.length === 0) {
        throw new Error(`Nome de categoria "${nome}" não pode ser convertido em código válido`);
      }

      const categoriaData: CategoriaRequest = {
        nome: nome,
        codigo: codigo,
        descricao: `Categoria: ${nome}`,
        departamento: departamentoId
      };

      const newCategoria = await apiPost<ApiResponse<any>>('/categorias', categoriaData);
      return newCategoria.data._id;
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar/criar categoria:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      throw new Error(`Erro ao processar categoria "${nome}": ${errorMessage}`);
    }
  }

  // Buscar ou criar tipo
  static async buscarOuCriarTipo(nome: string): Promise<string> {
    try {
      const response = await apiGet<{ success: boolean; data: any[] }>('/tipos', { q: nome });

      if (response.data && response.data.length > 0) {
        const tipo = response.data.find(tip =>
          tip.nome.toLowerCase() === nome.toLowerCase()
        );
        if (tipo) return tipo._id;
      }

      const codigo = this.normalizeString(nome);
      
      // Garantir que o código não esteja vazio após limpeza
      if (!codigo || codigo.length === 0) {
        throw new Error(`Nome de tipo "${nome}" não pode ser convertido em código válido`);
      }
      
      const tipoData: TipoRequest = {
        nome: nome,
        codigo: codigo,
        descricao: `Tipo: ${nome}`
      };
      
      const newTipo = await apiPost<ApiResponse<any>>('/tipos', tipoData);
      return newTipo.data._id;
      
    } catch (error: any) {
      console.error('❌ Erro ao buscar/criar tipo:', error);
      const errorMessage = error?.message || 'Erro desconhecido';
      throw new Error(`Erro ao processar tipo "${nome}": ${errorMessage}`);
    }
  }

  // Upload completo com criação automática de categoria e tipo
  static async uploadDocumento(data: {
    titulo: string;
    descricao?: string;
    categoriaNome: string;
    tipoNome: string;
    departamento: string;
    usuario: string;
    tipoMovimento: 'enviado' | 'recebido' | 'interno';
    remetente?: string;
    destinatario?: string;
    responsavel?: string;
    dataEnvio?: string;
    dataRecebimento?: string;
    tags?: string[];
    arquivo: File;
  }): Promise<any> {
    try {
      const categoriaId = await this.buscarOuCriarCategoria(data.categoriaNome, data.departamento);
      const tipoId = await this.buscarOuCriarTipo(data.tipoNome);

      const documentoData: DocumentoCreateData = {
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: categoriaId,
        tipo: tipoId,
        departamento: data.departamento,
        usuario: data.usuario,
        tipoMovimento: data.tipoMovimento,
        remetente: data.remetente,
        destinatario: data.destinatario,
        responsavel: data.responsavel,
        dataEnvio: data.dataEnvio,
        dataRecebimento: data.dataRecebimento,
        tags: data.tags,
        arquivo: data.arquivo
      };

      return await DocumentosService.criar(documentoData);
    } catch (error) {
      throw error;
    }
  }

  // Upload directo ao R2 via URL pré-assinada com progresso real
  static async uploadComPresign(data: {
    titulo: string;
    descricao?: string;
    categoria: string;
    tipo?: string;
    departamento: string;
    tipoMovimento: 'enviado' | 'recebido' | 'interno';
    remetente?: string;
    destinatario?: string;
    responsavel?: string;
    dataEmissao?: string;
    dataEnvio?: string;
    dataRecebimento?: string;
    tags?: string[];
    arquivo: File;
    onProgress?: (pct: number) => void;
  }): Promise<any> {
    const { arquivo, onProgress, ...meta } = data;

    onProgress?.(5);

    // 1. Obter URL pré-assinada do backend
    const initRes = await apiPost<ApiResponse<{ uploadUrl: string; fileId: string; key: string; expiresIn: number }>>(
      '/documentos/initiate-upload',
      { originalName: arquivo.name, mimeType: arquivo.type, size: arquivo.size }
    );
    const { uploadUrl, fileId, key } = initRes.data;

    onProgress?.(10);

    // 2. PUT do ficheiro directamente ao R2 com tracking de progresso
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', arquivo.type);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = 10 + Math.round((e.loaded / e.total) * 80);
          onProgress?.(pct);
        }
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve();
        else reject(new Error(`Upload R2 falhou: ${xhr.status} ${xhr.statusText}`));
      };
      xhr.onerror = () => reject(new Error('Erro de rede durante o upload'));
      xhr.send(arquivo);
    });

    onProgress?.(92);

    // 3. Registar documento no backend
    const doc = await apiPost<ApiResponse<any>>('/documentos/complete-upload', {
      fileId,
      key,
      originalName: arquivo.name,
      mimeType: arquivo.type,
      size: arquivo.size,
      ...meta,
    });

    onProgress?.(100);
    return doc.data;
  }

  // Upload usando IDs de categoria e tipo existentes
  static async uploadDocumentoComIDs(data: {
    titulo: string;
    descricao?: string;
    categoria: string; // ID da categoria
    tipo?: string; // ID do tipo (OPCIONAL - algumas categorias não têm tipos)
    departamento: string;
    usuario: string;
    tipoMovimento: 'enviado' | 'recebido' | 'interno';
    remetente?: string;
    destinatario?: string;
    responsavel?: string;
    dataEnvio?: string;
    dataRecebimento?: string;
    tags?: string[];
    arquivo: File;
  }): Promise<any> {
    try {
      const documentoData: DocumentoCreateData = {
        titulo: data.titulo,
        descricao: data.descricao,
        categoria: data.categoria,
        ...(data.tipo && { tipo: data.tipo }),
        departamento: data.departamento,
        usuario: data.usuario,
        tipoMovimento: data.tipoMovimento,
        remetente: data.remetente,
        destinatario: data.destinatario,
        responsavel: data.responsavel,
        dataEnvio: data.dataEnvio,
        dataRecebimento: data.dataRecebimento,
        tags: data.tags,
        arquivo: data.arquivo
      };

      return await DocumentosService.criar(documentoData);
    } catch (error) {
      throw error;
    }
  }
}
