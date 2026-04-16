"use client";

import React, { useState, useMemo } from "react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { useGlobalStats, useDashboardStats, useMyDepartmentStats } from "@/hooks/useStats";
import { useAuth } from "@/hooks/useAuth";
import { 
  Search, 
  FileText, 
  Folder,  
  Download, 
  Eye, 
  MoreVertical,
  Plus,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Building2,
  Users,
  FolderOpen,
  TrendingUp,
  Activity,
  BarChart3,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import { useToastContext } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ManageLayout from "@/components/ui/ManageLayout";

interface Document {
  id: string;
  title: string;
  department: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  lastModified: string;
  tags: string[];
  status: 'active' | 'archived' | 'pending';
}

interface Department {
  id: string;
  name: string;
  color: string;
  documentCount: number;
  activeUsers: number;
  lastActivity: string;
}

const AdminDashboardPage = () => {
  const { success } = useToastContext();
  const router = useRouter();
  const { user, isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Editor vê apenas estatísticas do seu departamento
  const myDepartmentStats = useMyDepartmentStats();
  
  // Admin vê estatísticas globais
  const adminDashboardStats = useDashboardStats();
  
  // Usar estatísticas apropriadas baseado no role
  const isUserAdmin = isAdmin();
  const stats = isUserAdmin ? adminDashboardStats : {
    global: { 
      data: myDepartmentStats.data ? {
        resumo: {
          totalDocumentos: myDepartmentStats.data.documentos?.total || 0,
          totalDepartamentos: 1,
          totalUsuarios: 0, // SingleDepartmentStats não tem total de usuários
          totalCategorias: myDepartmentStats.data.documentos?.porCategoria?.length || 0,
          totalTipos: myDepartmentStats.data.documentos?.porTipo?.length || 0,
          documentosAtivos: myDepartmentStats.data.documentos?.ativos || 0,
          documentosArquivados: myDepartmentStats.data.documentos?.arquivados || 0,
          documentosRecentes: myDepartmentStats.data.documentos?.recentes?.length || 0
        },
        distribuicoes: {
          porDepartamento: user?.departamento ? [{
            nome: user.departamento.nome,
            quantidade: myDepartmentStats.data.documentos?.total || 0
          }] : [],
          porTipo: myDepartmentStats.data.documentos?.porTipo || [],
          porMovimento: []
        },
        tendencias: {
          crescimentoSemanal: 0,
          taxaAtivos: '0%'
        }
      } : null,
      loading: myDepartmentStats.loading,
      error: myDepartmentStats.error,
      refetch: myDepartmentStats.refetch
    },
    documents: {
      data: myDepartmentStats.data ? {
        totais: {
          total: myDepartmentStats.data.documentos?.total || 0,
          ativos: myDepartmentStats.data.documentos?.ativos || 0,
          arquivados: myDepartmentStats.data.documentos?.arquivados || 0
        },
        distribuicoes: {
          porDepartamento: user?.departamento ? [{
            departamento: user.departamento.nome,
            quantidade: myDepartmentStats.data.documentos?.total || 0
          }] : [],
          porCategoria: myDepartmentStats.data.documentos?.porCategoria || [],
          porTipo: myDepartmentStats.data.documentos?.porTipo || [],
          porMovimento: []
        },
        recentes: myDepartmentStats.data.documentos?.recentes || [],
        tendencias: {
          porMes: []
        }
      } : null,
      loading: myDepartmentStats.loading,
      error: myDepartmentStats.error,
      refetch: myDepartmentStats.refetch
    },
    departments: {
      data: myDepartmentStats.data ? {
        totais: {
          total: 1,
          ativos: 1,
          inativos: 0
        },
        distribuicoes: {
          categorias: user?.departamento ? [{
            departamento: user.departamento.nome,
            quantidade: myDepartmentStats.data.documentos?.porCategoria?.length || 0
          }] : [],
          usuarios: user?.departamento ? [{
            departamento: user.departamento.nome,
            quantidade: 0
          }] : [],
          documentos: user?.departamento ? [{
            departamento: user.departamento.nome,
            quantidade: myDepartmentStats.data.documentos?.total || 0
          }] : []
        }
      } : null,
      loading: myDepartmentStats.loading,
      error: myDepartmentStats.error,
      refetch: myDepartmentStats.refetch
    },
    loading: myDepartmentStats.loading,
    error: myDepartmentStats.error,
    refetchAll: myDepartmentStats.refetch
  };

  const { 
    global: globalStats, 
    documents: documentStats, 
    departments: departmentStats,
    loading, 
    error, 
    refetchAll 
  } = stats;

  // Dados reais vindos do backend
  // Departamentos reais vindos do backend
  const departments: Department[] = useMemo(() => {
    if (!departmentStats?.data) return [];
    // departmentStats.data.distribuicoes.documentos: Array<{ departamento: string; quantidade: number }>
    // Mapear usuários ativos por departamento
    const usuariosPorDepartamento = (departmentStats.data.distribuicoes?.usuarios || []);
    return (departmentStats.data.distribuicoes?.documentos || []).map((dept, idx) => {
      const usuariosDept = usuariosPorDepartamento.find(u => u.departamento === dept.departamento);
      return {
        id: dept.departamento?.toLowerCase() || dept.departamento || String(idx),
        name: dept.departamento || "Departamento",
        color: "bg-blue-500",
        documentCount: dept.quantidade || 0,
        activeUsers: usuariosDept ? usuariosDept.quantidade : 0,
        lastActivity: "-"
      };
    });
  }, [departmentStats]);

  // Documentos reais vindos do backend
  const documents: Document[] = useMemo(() => {
    if (!documentStats?.data) return [];
    // documentStats.data.recentes pode ter estruturas diferentes para admin vs editor
    return (documentStats.data.recentes || []).map((doc: any) => ({
      id: doc._id,
      title: doc.titulo || "Documento",
      department: doc.departamento?.nome || (user?.departamento?.nome) || "-",
      type: doc.tipo?.nome || "-",
      size: "-",
      uploadedBy: doc.usuario?.nome || "-",
      uploadDate: doc.dataCriacao || "-",
      lastModified: doc.dataCriacao || "-",
      tags: [],
      status: "active" as const
    }));
  }, [documentStats, user]);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Calculamos crescimento baseado nos dados da API
  const crescimentoSemanal = globalStats?.data?.tendencias?.crescimentoSemanal || 0;
  const documentsGrowth = crescimentoSemanal > 0 
    ? calculateGrowth(crescimentoSemanal, crescimentoSemanal * 0.8)
    : 0;

  const handleViewDocument = (doc: Document) => {
    success(`Visualizando documento: ${doc.title}`);
  };

  const handleDownloadDocument = (doc: Document) => {
    success(`Download iniciado: ${doc.title}`);
  };

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const matchesSearch = doc.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && Array.isArray(doc.tags) && doc.tags.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesDepartment = selectedDepartment === "all" ||
        doc.department?.toLowerCase() === selectedDepartment.toLowerCase();
      return matchesSearch && matchesDepartment;
    });
  }, [documents, searchTerm, selectedDepartment]);

  const filteredDepartments = useMemo(() => {
    return departments.filter(dept =>
      dept.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [departments, searchTerm]);

  return (
    <ManageLayout>
      <div>
        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-gray-600">Carregando estatísticas...</span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <div className="w-5 h-5 text-red-500 mr-2">⚠️</div>
              <div>
                <h3 className="text-red-800 font-medium">Erro ao carregar estatísticas</h3>
                <p className="text-red-600 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Content - só renderiza se não está loading e não há error */}
        {!loading && !error && (
          <>
        {/* Header com Título e Botão de Atualizar */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard Administrativo</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Visão geral do sistema e estatísticas</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <ModernButton
                onClick={refetchAll}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Atualizar</span>
              </ModernButton>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span>Erro ao carregar estatísticas: {error}</span>
            </div>
          </div>
        )}

        {/* Cards de Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total de Documentos */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total de Documentos</p>
                {loading ? (
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                ) : error ? (
                  <p className="text-2xl font-bold text-red-500">--</p>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">
                    {formatNumber(globalStats?.data?.resumo?.totalDocumentos || 0)}
                  </p>
                )}
                <div className="flex items-center mt-1">
                  <TrendingUp className={`w-4 h-4 mr-1 ${documentsGrowth >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${documentsGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {documentsGrowth >= 0 ? '+' : ''}{formatPercent(documentsGrowth)}% recente
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Departamentos */}
          <Link href="/manage/departamentos">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Departamentos</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  ) : error ? (
                    <p className="text-2xl font-bold text-red-500">--</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(globalStats?.data?.resumo?.totalDepartamentos || 0)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(globalStats?.data?.resumo?.totalUsuarios || 0)} usuários ativos
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </Link>

          {/* Usuários */}
          <Link href="/manage/usuarios">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Usuários</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  ) : error ? (
                    <p className="text-2xl font-bold text-red-500">--</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(globalStats?.data?.resumo?.totalUsuarios || 0)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">Sistema ativo</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Link>

          {/* Categorias */}
          <Link href="/manage/categorias">
            <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Categorias</p>
                  {loading ? (
                    <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                  ) : error ? (
                    <p className="text-2xl font-bold text-red-500">--</p>
                  ) : (
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(globalStats?.data?.resumo?.totalCategorias || 0)}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-1">
                    {formatNumber(globalStats?.data?.resumo?.totalTipos || 0)} tipos disponíveis
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Seção de Atividade Recente e Distribuição */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Atividade Recente */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
              <Activity className="w-5 h-5 text-gray-400" />
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                ))}
              </div>
            ) : documentStats?.data?.recentes?.length ? (
              <div className="space-y-4">
                {documentStats.data.recentes.map((doc: any) => (
                  <div key={doc._id} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      {doc.titulo} ({doc.tipo?.nome || '-'}) - {doc.departamento?.nome || user?.departamento?.nome || '-'} em {doc.dataCriacao ? new Date(doc.dataCriacao).toLocaleDateString() : '-'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 text-sm">Nenhuma atividade recente encontrada.</div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Resumo Rápido</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex justify-between">
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-12 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Documentos Ativos</span>
                  <span className="text-sm font-medium text-green-600">
                    {formatNumber(documentStats?.data?.totais?.ativos || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Documentos Arquivados</span>
                  <span className="text-sm font-medium text-gray-600">
                    {formatNumber(documentStats?.data?.totais?.arquivados || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total de Documentos</span>
                  <span className="text-sm font-medium text-blue-600">
                    {formatNumber(documentStats?.data?.totais?.total || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Crescimento Semanal</span>
                  <span className="text-sm font-medium text-purple-600">
                    +{formatNumber(globalStats?.data?.tendencias?.crescimentoSemanal || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Departamentos (mantida como estava) */}
        <div className="mt-8 bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Departamentos</h3>
                <p className="text-sm text-gray-600">Gerencie departamentos e suas atividades</p>
              </div>
              <Link href="/manage/departamentos">
                <ModernButton className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Novo Departamento</span>
                </ModernButton>
              </Link>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepartments.map(dept => (
                <div key={dept.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-4 h-4 ${dept.color} rounded-full`}></div>
                    <span className="text-xs text-gray-500">{dept.lastActivity}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-2">{dept.name}</h4>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>{dept.documentCount} docs</span>
                    <span>{dept.activeUsers} usuários</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </ManageLayout>
  );
};

export default AdminDashboardPage;
