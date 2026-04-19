// Tipos baseados nos models do backend

export interface Departamento {
  _id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CategoriaDocumento {
  _id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  departamento: string | Departamento; // ID ou objeto populado
  cor?: string;         // Código hexadecimal (#RRGGBB)
  icone?: string;       // Nome do ícone
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface TipoDocumento {
  _id: string;
  nome: string;
  codigo: string;
  descricao?: string;
  categoria: string | CategoriaDocumento; // ID ou objeto populado
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Usuario {
  _id: string;
  nome: string;
  apelido: string;
  username: string;
  senha?: string;
  tenant?: string;
  departamento?: string | Departamento;
  role: 'superadmin' | 'org_admin' | 'admin' | 'editor' | 'user';
  ativo: boolean;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface Documento {
  _id: string;
  titulo: string;
  descricao?: string;
  categoria: string | CategoriaDocumento;     // ID ou objeto populado
  tipo?: string | TipoDocumento;             // ID ou objeto populado (OPCIONAL - algumas categorias não têm tipos)
  departamento: string | Departamento;       // ID ou objeto populado
  usuario: string | Usuario;                 // ID ou objeto populado
  tipoMovimento: 'enviado' | 'recebido' | 'interno';
  remetente?: string;    // Para documentos recebidos
  destinatario?: string; // Para documentos enviados
  responsavel?: string;  // Para documentos internos
  dataEnvio?: string;    // Para documentos enviados
  dataRecebimento?: string; // Para documentos recebidos
  arquivo: {
    cloudinaryId: string;
    url: string;
    secureUrl: string;
    originalName: string;
    format: string;
    size: number;
    resourceType?: 'image' | 'raw' | 'video' | 'auto';
  };
  status: 'ativo' | 'arquivado';
  tags: string[];
  ativo: boolean;
  ultimaEdicao?: {
    usuario: string | Usuario;
    data: string;
    descricao?: string;
  };
  dataCriacao: string;
  dataAtualizacao: string;
}

// Tipos para as respostas da API (baseado em http.ts)
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: Record<string, any>;
}

export interface ApiPaginatedResponse<T> {
  success: boolean;
  data: T[];
  page: number;
  limit: number;
  total: number;
  meta?: Record<string, any>;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  details?: any;
}

// Tipos para filtros e queries (baseado em buildQuery.ts)
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  q?: string;
  ativo?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartamentoQueryParams extends BaseQueryParams {}

export interface CategoriaQueryParams extends BaseQueryParams {
  departamento?: string;
}

export interface TipoQueryParams extends BaseQueryParams {
  categoria?: string;
  departamento?: string;
}

export interface DocumentoQueryParams extends BaseQueryParams {
  departamento?: string;
  categoria?: string;
  tipo?: string;
  tipoMovimento?: 'enviado' | 'recebido' | 'interno';
  status?: 'ativo' | 'arquivado';
}

export interface UsuarioQueryParams extends BaseQueryParams {
  role?: 'superadmin' | 'org_admin' | 'admin' | 'editor' | 'user';
}

// Tipos para criação/edição (omitindo campos automáticos)
export interface CreateDepartamento {
  nome: string;
  codigo: string;
  descricao?: string;
  ativo?: boolean;
}

export interface UpdateDepartamento extends Partial<CreateDepartamento> {}

export interface CreateCategoriaDocumento {
  nome: string;
  codigo: string;
  descricao?: string;
  departamento: string;
  cor?: string;
  icone?: string;
  ativo?: boolean;
}

export interface UpdateCategoriaDocumento extends Partial<CreateCategoriaDocumento> {}

export interface CreateTipoDocumento {
  nome: string;
  codigo: string;
  descricao?: string;
  categoria: string; // ID da categoria
  ativo?: boolean;
}

export interface UpdateTipoDocumento extends Partial<CreateTipoDocumento> {}

export interface CreateDocumento {
  titulo: string;
  descricao?: string;
  categoria: string;
  tipo?: string; // OPCIONAL - algumas categorias não têm tipos específicos
  departamento: string;
  usuario?: string; // OPCIONAL - se não enviado, backend usa req.user (JWT)
  tipoMovimento: 'enviado' | 'recebido' | 'interno';
  remetente?: string;
  destinatario?: string;
  responsavel?: string;
  dataEnvio?: string;
  dataRecebimento?: string;
  tags?: string[];
  status?: 'ativo' | 'arquivado';
  ativo?: boolean;
}

export interface UpdateDocumento extends Partial<CreateDocumento> {}

export interface CreateUsuario {
  nome: string;
  apelido: string;
  username: string;
  senha: string;
  departamento?: string;
  role?: 'superadmin' | 'org_admin' | 'admin' | 'editor' | 'user';
  ativo?: boolean;
}

export interface UpdateUsuario extends Partial<Omit<CreateUsuario, 'senha'>> {
  senha?: string; // Optional for updates
}

// Tipos específicos para services
export interface UsuarioCreateData extends CreateUsuario {}
export interface UsuarioUpdateData extends UpdateUsuario {}

// Tipos para paginação e query parameters
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface BaseQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface DepartamentoQueryParams extends BaseQueryParams {
  ativo?: boolean;
}

export interface CategoriaQueryParams extends BaseQueryParams {
  departamento?: string;
  ativo?: boolean;
}

export interface TipoQueryParams extends BaseQueryParams {
  ativo?: boolean;
  categoria?: string; // Filtrar por categoria
}

export interface DocumentoQueryParams extends BaseQueryParams {
  categoria?: string;
  tipo?: string;
  departamento?: string;
  tipoMovimento?: 'enviado' | 'recebido' | 'interno';
  status?: 'ativo' | 'arquivado';
  ativo?: boolean;
  dataInicio?: string;
  dataFim?: string;
}
