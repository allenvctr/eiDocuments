import { useState, useEffect } from 'react';
import statsService, {
  GlobalStats,
  DocumentStats,
  DepartmentStats,
  SingleDepartmentStats,
  UserStats,
  CategoryStats,
  TypeStats
} from '@/services/statsService';

interface UseStatsState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook genérico para estatísticas
function useStatsQuery<T>(
  queryFn: () => Promise<T>,
  deps: any[] = [],
  enabled: boolean = true
): UseStatsState<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      setError(null);
      const result = await queryFn();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar estatísticas';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) fetchData();
    else setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, enabled]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

// Hook para estatísticas globais (dashboard)
export function useGlobalStats(): UseStatsState<GlobalStats> {
  return useStatsQuery(() => statsService.getGlobalStats());
}

// Hook para estatísticas de documentos
export function useDocumentStats(): UseStatsState<DocumentStats> {
  return useStatsQuery(() => statsService.getDocumentStats());
}

// Hook para estatísticas gerais de departamentos
export function useDepartmentStats(): UseStatsState<DepartmentStats> {
  return useStatsQuery(() => statsService.getDepartmentStats());
}

// Hook para estatísticas de um departamento específico
export function useSingleDepartmentStats(departmentId: string): UseStatsState<SingleDepartmentStats> {
  return useStatsQuery(
    () => statsService.getSingleDepartmentStats(departmentId),
    [departmentId]
  );
}

// Hook para estatísticas do próprio departamento do usuário logado.
// Passa enabled=false quando o utilizador não tem departamento (admin, org_admin, superadmin).
export function useMyDepartmentStats(enabled: boolean = true): UseStatsState<SingleDepartmentStats> {
  return useStatsQuery(() => statsService.getMyDepartmentStats(), [], enabled);
}

// Hook para estatísticas de usuários
export function useUserStats(): UseStatsState<UserStats> {
  return useStatsQuery(() => statsService.getUserStats());
}

// Hook para estatísticas de categorias
export function useCategoryStats(): UseStatsState<CategoryStats> {
  return useStatsQuery(() => statsService.getCategoryStats());
}

// Hook para estatísticas de tipos
export function useTypeStats(): UseStatsState<TypeStats> {
  return useStatsQuery(() => statsService.getTypeStats());
}

// Hook combinado para dashboard admin (carrega múltiplas estatísticas)
export function useDashboardStats() {
  const globalStats = useGlobalStats();
  const documentStats = useDocumentStats();
  const departmentStats = useDepartmentStats();

  return {
    global: globalStats,
    documents: documentStats,
    departments: departmentStats,
    loading: globalStats.loading || documentStats.loading || departmentStats.loading,
    error: globalStats.error || documentStats.error || departmentStats.error,
    refetchAll: async () => {
      await Promise.all([
        globalStats.refetch(),
        documentStats.refetch(),
        departmentStats.refetch()
      ]);
    }
  };
}

// Hook para refresh automático das estatísticas
export function useAutoRefreshStats(intervalMs: number = 30000) {
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(Date.now());
    }, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);

  return {
    lastUpdate,
    forceRefresh: () => setLastUpdate(Date.now())
  };
}

// Hook para comparação de estatísticas (útil para trends)
export function useStatsComparison<T>(
  currentData: T | null,
  previousData: T | null
) {
  const [comparison, setComparison] = useState<{
    hasChanges: boolean;
    changes: Partial<T>;
  } | null>(null);

  useEffect(() => {
    if (!currentData || !previousData) {
      setComparison(null);
      return;
    }

    // Comparação simples - pode ser expandida para comparações mais complexas
    const hasChanges = JSON.stringify(currentData) !== JSON.stringify(previousData);
    
    setComparison({
      hasChanges,
      changes: currentData // Simplificado - pode implementar diff mais complexo
    });
  }, [currentData, previousData]);

  return comparison;
}
