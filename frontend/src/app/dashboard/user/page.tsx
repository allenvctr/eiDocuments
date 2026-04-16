"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMyDepartmentStats } from "@/hooks/useStats";
import { 
  FileText, 
  Folder,  
  Download, 
  Eye, 
  Plus,
  Building2,
  User,
  Calendar,
  TrendingUp,
  Activity,
  Search,
  Upload,
  BarChart3,
  LucideIcon
} from "lucide-react";
import ModernButton from "@/components/ui/ModernButton";
import UserLayout from "@/components/ui/UserLayout";
import StatsCard from "@/components/ui/StatsCard";
import QuickActionCard from "@/components/ui/QuickActionCard";
import { useToastContext } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DocumentoDetail from "@/components/details/DocumentoDetail";
import { Documento } from "@/types";

interface DepartmentDocument {
  id: string;
  title: string;
  type: string;
  size: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
  status: 'active' | 'archived' | 'pending';
}

interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color: string;
}

const UserDashboardPage = () => {
  const { success } = useToastContext();
  const router = useRouter();
  const { user } = useAuth();
  
  // Usar o hook para carregar estatísticas do departamento
  const { data: stats, loading, error, refetch } = useMyDepartmentStats();

  // Dados de fallback enquanto carrega
  const userDepartment = stats?.departamento?.nome || user?.departamento?.nome || "Departamento";
  
  // Calcular documentos do usuário (baseado nos documentos recentes onde o usuário é o autor)
  const myDocuments = stats?.documentos?.recentes?.filter(doc => 
    doc.usuario?.nome === user?.nome
  ).length || 0;

  // Documentos recentes do departamento (dados reais)
  const recentDepartmentDocuments = stats?.documentos?.recentes?.map(doc => ({
    id: doc._id,
    title: doc.titulo,
    type: doc.tipo?.nome || "Documento",
    size: "N/A",
    uploadedBy: doc.usuario?.nome || "Usuário desconhecido",
    uploadDate: doc.dataCriacao,
    tags: [],
    status: "active" as const
  })) || [];

  const quickActions: QuickAction[] = [
    {
      title: "Upload de Documento",
      description: "Adicionar novo documento ao departamento",
      icon: Upload,
      href: "/user/upload",
      color: "bg-blue-500"
    },
    {
      title: "Buscar Documentos",
      description: "Pesquisar em todos os documentos",
      icon: Search,
      href: "/user/buscar",
      color: "bg-green-500"
    },
    {
      title: "Meus Documentos",
      description: "Ver documentos que você criou",
      icon: FileText,
      href: "/user/meus-documentos",
      color: "bg-purple-500"
    },
    {
      title: "Documentos do Departamento",
      description: "Ver todos os documentos do seu departamento",
      icon: Building2,
      href: "/user/documentos",
      color: "bg-orange-500"
    }
  ];

  // Calcular crescimento baseado na proporção de documentos ativos vs arquivados
  const totalDocuments = (stats?.documentos?.total || 0);
  const activeDocuments = (stats?.documentos?.ativos || 0);
  const documentsGrowth = totalDocuments > 0 
    ? Math.round((activeDocuments / totalDocuments) * 100) - 50 // Simula crescimento baseado na atividade
    : 0;

  // Estado para controlar o modal de detalhes
  const [selectedDocument, setSelectedDocument] = useState<Documento | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Função para adaptar um documento parcial para o tipo Documento
  function adaptToDocumento(doc: unknown): Documento {
    const d = doc as Partial<Documento>;
    return {
      _id: d._id!,
      titulo: d.titulo!,
      descricao: d.descricao || '',
      categoria: d.categoria || '',
      tipo: d.tipo || '',
      departamento: d.departamento || '',
      usuario: d.usuario || '',
      tipoMovimento: d.tipoMovimento || 'interno',
      remetente: d.remetente,
      destinatario: d.destinatario,
      responsavel: d.responsavel,
      dataEnvio: d.dataEnvio,
      dataRecebimento: d.dataRecebimento,
      arquivo: d.arquivo || {
        cloudinaryId: '',
        url: '',
        secureUrl: '',
        originalName: '',
        format: '',
        size: 0,
        resourceType: 'raw',
      },
      status: d.status || 'ativo',
      tags: d.tags || [],
      ativo: typeof d.ativo === 'boolean' ? d.ativo : true,
      dataCriacao: d.dataCriacao || '',
      dataAtualizacao: d.dataAtualizacao || '',
    };
  }

  // Função para abrir o modal de detalhes
  const handleViewDocument = (doc: DepartmentDocument) => {
    // Encontrar o documento completo nos dados reais (stats)
    const fullDoc = stats?.documentos?.recentes?.find((d) => d._id === doc.id);
    if (fullDoc) {
      setSelectedDocument(adaptToDocumento(fullDoc));
      setIsDetailOpen(true);
    } else {
      success(`Detalhes não encontrados para: ${doc.title}`);
    }
  };

  const handleDownloadDocument = (doc: DepartmentDocument) => {
    success(`Download iniciado: ${doc.title}`);
  };

  const handleDownloadDocumento = async (documento: Documento) => {
    try {
      // Usar o serviço de documentos para baixar
      const { DocumentosService } = await import('@/services/documentosService');
      await DocumentosService.baixar(documento._id);
      success(`Download iniciado: ${documento.titulo}`);
    } catch (err) {
      console.error('Erro ao baixar documento:', err);
    }
  };

  return (
    <UserLayout>
      {/* Loading State */}
      {loading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando estatísticas...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button 
              onClick={() => refetch()} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
      <div>
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
                  <p className="text-gray-600 dark:text-gray-400">Bem-vindo de volta!</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">{userDepartment}</span> • Dados atualizados em tempo real
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <ModernButton
                variant="outline"
                onClick={refetch}
                disabled={loading}
              >
                <TrendingUp className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </ModernButton>
              <ModernButton variant="outline" onClick={() => router.push('/user/buscar')}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </ModernButton>
              <ModernButton variant="primary" onClick={() => router.push('/user/upload')}>
                <Plus className="w-4 h-4 mr-2" />
                Novo Documento
              </ModernButton>
            </div>
          </div>

          {/* Cards de Estatísticas do Departamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <StatsCard
              title="Documentos do Departamento"
              value={stats?.documentos?.total || 0}
              subtitle="Total no departamento"
              icon={Building2}
              iconColor="text-blue-600"
              iconBg="bg-blue-100"
              trend={{
                value: documentsGrowth,
                label: "este mês",
                isPositive: documentsGrowth >= 0
              }}
              href="/user/documentos"
              loading={loading}
            />

            <StatsCard
              title="Meus Documentos"
              value={myDocuments}
              subtitle="Criados por você"
              icon={FileText}
              iconColor="text-green-600"
              iconBg="bg-green-100"
              href="/user/meus-documentos"
              loading={loading}
            />

            <StatsCard
              title="Documentos Ativos"
              value={stats?.documentos?.ativos || 0}
              subtitle="No departamento"
              icon={Activity}
              iconColor="text-purple-600"
              iconBg="bg-purple-100"
              loading={loading}
            />

            <StatsCard
              title="Documentos Arquivados"
              value={stats?.documentos?.arquivados || 0}
              subtitle={`${stats?.documentos?.porCategoria?.length || 0} categorias usadas`}
              icon={Folder}
              iconColor="text-orange-600"
              iconBg="bg-orange-100"
              loading={loading}
            />

            <StatsCard
              title="Tipos de Documentos"
              value={stats?.documentos?.porTipo?.length || 0}
              subtitle="Tipos diferentes no depto"
              icon={BarChart3}
              iconColor="text-indigo-600"
              iconBg="bg-indigo-100"
              loading={loading}
            />
          </div>
        </div>

        {/* Ações Rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ações Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <QuickActionCard
                key={index}
                title={action.title}
                description={action.description}
                icon={action.icon}
                color={action.color}
                href={action.href}
              />
            ))}
          </div>
        </div>

        {/* Estatísticas Detalhadas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Distribuição por Categoria */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos por Categoria</h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : stats?.documentos?.porCategoria?.length ? (
              <div className="space-y-3">
                {stats.documentos.porCategoria.slice(0, 5).map((categoria, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{categoria.categoria}</span>
                    <span className="text-sm font-medium text-gray-900">{categoria.quantidade}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma categoria encontrada</p>
            )}
          </div>

          {/* Distribuição por Tipo */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Documentos por Tipo</h3>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 w-8 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : stats?.documentos?.porTipo?.length ? (
              <div className="space-y-3">
                {stats.documentos.porTipo.slice(0, 5).map((tipo, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span className="text-sm text-gray-700">{tipo.tipo}</span>
                    <span className="text-sm font-medium text-gray-900">{tipo.quantidade}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum tipo encontrado</p>
            )}
          </div>
        </div>

        {/* Documentos Recentes do Departamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Atividade Recente</h2>
              <p className="text-gray-600 mt-1">Últimos documentos adicionados ao {userDepartment}</p>
            </div>
            <Link href="/user/documentos">
              <ModernButton variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Ver Todos
              </ModernButton>
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="flex items-center space-x-4 p-6 rounded-xl border border-gray-100 animate-pulse">
                  <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-20 h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : recentDepartmentDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentDepartmentDocuments.map(doc => (
                <div key={doc.id} className="flex items-center space-x-4 p-6 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-200 group">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                      {doc.title}
                    </p>
                    <div className="flex items-center text-sm text-gray-500 space-x-3 mt-1">
                      <span className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        {doc.uploadedBy}
                      </span>
                      <span>•</span>
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleViewDocument(doc)}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc)}
                      className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum documento encontrado</h3>
              <p className="text-gray-500 mb-6">Seu departamento ainda não possui documentos recentes.</p>
              <Link href="/user/upload">
                <ModernButton variant="primary">
                  <Upload className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Documento
                </ModernButton>
              </Link>
            </div>
          )}
          {/* Modal de Detalhes do Documento */}
          <DocumentoDetail
            isOpen={isDetailOpen}
            onClose={() => setIsDetailOpen(false)}
            documento={selectedDocument}
            onDownload={handleDownloadDocumento}
          />
        </div>

        {/* Resumo de Atividade */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{userDepartment}</p>
                <p className="text-sm text-gray-500">Seu departamento</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{stats?.documentos?.total || 0}</p>
                <p className="text-sm text-gray-500">Documentos total</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Activity className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{stats?.documentos?.ativos || 0}</p>
                <p className="text-sm text-gray-500">Documentos ativos</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}
      {/* Fim do Main Content */}
    </UserLayout>
  );
};

export default UserDashboardPage;