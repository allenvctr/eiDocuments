"use client";

import React from 'react';
import { FolderOpen, Search, Shield, BarChart3 } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: FolderOpen,
      title: "Organização Inteligente",
      description: "Departamentos, categorias e tipos personalizáveis",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900"
    },
    {
      icon: Search,
      title: "Busca Poderosa",
      description: "Encontre qualquer documento em segundos",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900"
    },
    {
      icon: Shield,
      title: "Segurança Total",
      description: "Controle de acesso e backup automático",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-900"
    },
    {
      icon: BarChart3,
      title: "Relatórios Completos",
      description: "Dashboard com métricas e estatísticas",
      gradient: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-900"
    }
  ];

  return (
    <section id="recursos" className="py-32 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-20">
          <span className="inline-block px-4 py-2 bg-gradient-primary/10 text-primary-blue rounded-full text-sm font-bold mb-4">
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-center">
            Funcionalidades
          </h2>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className={`${feature.bgColor} rounded-2xl p-8 border-2 border-transparent hover:border-gray-200 transition-all hover:shadow-lg group`}
            >
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className={`text-2xl font-bold ${feature.textColor} mb-3`}>
                {feature.title}
              </h3>
              <p className="text-gray-700 text-lg">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection;