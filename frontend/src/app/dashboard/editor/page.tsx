"use client";

import React, { useState, useMemo } from "react";
import { formatNumber, formatPercent } from "@/lib/formatters";
import { useMyDepartmentStats } from "@/hooks/useStats";
import { useAuth } from "@/hooks/useAuth";
import { 
  FileText, 
  Folder,  
  Users,
  Building2,
  TrendingUp,
  Activity,
  BarChart3,
  RefreshCw,
  AlertCircle,
  FolderOpen,
  File
} from "lucide-react";
import { useToastContext } from "@/contexts/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ManageLayout from "@/components/ui/ManageLayout";

interface Document {
  id: string;
  title: string;
  category: string;
  type: string;
  uploadedBy: string;
  uploadDate: string;
}

const EditorDashboardPage = () => {
  const { success } = useToastContext();
  const router = useRouter();
  const { user } = useAuth();
  
  // Estatísticas do departamento do editor
  const { 
    data: stats, 
    loading, 
    error, 
    refetch 
  } = useMyDepartmentStats();

  // Documentos recentes do departamento
  const recentDocuments: Document[] = useMemo(() => {
    if (!stats?.documentos?.recentes) return [];
    return stats.documentos.recentes.map((doc: any) => ({
      id: doc._id,
      title: doc.titulo || "Documento",
      category: doc.categoria?.nome || "-",
      type: doc.tipo?.nome || "-",
      uploadedBy: doc.usuario?.nome || "-",
      uploadDate: doc.dataCriacao || "-",
    }));
  }, [stats]);

  const departmentName = stats?.departamento?.nome || user?.departamento?.nome || "Meu Departamento";

  return (
    <ManageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Dashboard - {departmentName}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Visão geral do departamento
            </p>
          </div>
          
          <button
            onClick={refetch}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Erro ao carregar estatísticas</h3>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2">
                  Dica: Tente fazer logout e login novamente para atualizar suas credenciais.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Documentos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total de Documentos</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                  {loading ? "-" : formatNumber(stats?.documentos?.total || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Documentos Ativos */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Documentos Ativos</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {loading ? "-" : formatNumber(stats?.documentos?.ativos || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          {/* Documentos Arquivados */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Arquivados</p>
                <p className="text-3xl font-bold text-gray-600 dark:text-gray-400 mt-2">
                  {loading ? "-" : formatNumber(stats?.documentos?.arquivados || 0)}
                </p>
              </div>
              <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                <Folder className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
          </div>

          {/* Categorias */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Categorias</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">
                  {loading ? "-" : formatNumber(stats?.categorias?.total || 0)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
                <FolderOpen className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Categorias do departamento</p>
          </div>
        </div>
        )}

        {/* Second Row - Tipos */}
        {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
          {/* Tipos de Documento */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipos de Documento</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
                  {loading ? "-" : formatNumber(stats?.tipos?.total || 0)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-full">
                <File className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tipos disponíveis no departamento</p>
          </div>
        </div>
        )}

        {/* Charts Row */}
        {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Documentos por Categoria */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Documentos por Categoria
            </h3>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : stats?.documentos?.porCategoria && stats.documentos.porCategoria.length > 0 ? (
              <div className="space-y-3">
                {stats.documentos.porCategoria.map((item: any, idx: number) => {
                  const percentage = ((item.quantidade / (stats.documentos?.total || 1)) * 100).toFixed(1);
                  const colors = ['bg-green-500', 'bg-teal-500', 'bg-purple-500', 'bg-yellow-500', 'bg-pink-500'];
                  const color = colors[idx % colors.length];
                  
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.categoria || 'Sem categoria'}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.quantidade} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>

          {/* Documentos por Tipo */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center">
              <File className="w-5 h-5 mr-2 text-purple-600 dark:text-purple-400" />
              Documentos por Tipo
            </h3>
            
            {loading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            ) : stats?.documentos?.porTipo && stats.documentos.porTipo.length > 0 ? (
              <div className="space-y-3">
                {stats.documentos.porTipo.slice(0, 5).map((item: any, idx: number) => {
                  const percentage = ((item.quantidade / (stats.documentos?.total || 1)) * 100).toFixed(1);
                  const colors = ['bg-violet-500', 'bg-cyan-500', 'bg-teal-500', 'bg-orange-500', 'bg-red-500'];
                  const color = colors[idx % colors.length];
                  
                  return (
                    <div key={idx}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.tipo || 'Sem tipo'}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.quantidade} ({percentage}%)</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className={`${color} h-2 rounded-full transition-all duration-300`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">Nenhum dado disponível</p>
            )}
          </div>
        </div>
        )}

        {/* Recent Documents */}
        {!loading && !error && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-green-600 dark:text-green-400" />
              Documentos Recentes
            </h3>
            <Link 
              href="/manage/documentos"
              className="text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium"
            >
              Ver todos →
            </Link>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          ) : recentDocuments.length > 0 ? (
            <div className="space-y-3">
              {recentDocuments.slice(0, 5).map((doc) => (
                <div 
                  key={doc.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                      <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{doc.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {doc.category} • {doc.type}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400">{doc.uploadedBy}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(doc.uploadDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">Nenhum documento recente</p>
            </div>
          )}
        </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/manage/documentos"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-green-500 hover:shadow-md transition-all group"
          >
            <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Gerenciar Documentos</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Visualizar e editar documentos do departamento</p>
          </Link>

          <Link
            href="/manage/categorias"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-purple-500 hover:shadow-md transition-all group"
          >
            <FolderOpen className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Categorias</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gerenciar categorias do departamento</p>
          </Link>

          <Link
            href="/manage/tipos"
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-green-500 hover:shadow-md transition-all group"
          >
            <File className="w-8 h-8 text-green-600 dark:text-green-400 mb-3 group-hover:scale-110 transition-transform" />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Tipos de Documento</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Gerenciar tipos de documentos</p>
          </Link>
        </div>
      </div>
    </ManageLayout>
  );
};

export default EditorDashboardPage;
