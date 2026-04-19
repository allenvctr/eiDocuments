"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const DashboardPage = () => {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // Redirecionar baseado no role do usuário
      if (user.role === 'superadmin' || user.role === 'org_admin' || user.role === 'admin') {
        router.replace('/dashboard/admin');
      } else if (user.role === 'editor') {
        router.replace('/dashboard/editor');
      } else {
        router.replace('/dashboard/user');
      }
    } else if (!loading && !user) {
      // Se não autenticado, redirecionar para login
      router.replace('/login');
    }
  }, [router, user, loading]);

  // Não renderizar nada enquanto redireciona
  if (loading || user) {
    return null;
  }

  // Loading state enquanto redireciona - não renderizar nenhum layout
  return null;
};

export default DashboardPage;