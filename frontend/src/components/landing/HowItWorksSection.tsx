"use client";

import React from 'react';
import { UserPlus, Upload, Sparkles } from 'lucide-react';

const HowItWorksSection = () => {
  const steps = [
    {
      number: "1",
      icon: UserPlus,
      title: "Crie sua Conta",
      description: "Cadastro em 2 minutos",
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-50"
    },
    {
      number: "2",
      icon: Upload,
      title: "Organize Documentos",
      description: "Upload simples e rápido",
      gradient: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50"
    },
    {
      number: "3",
      icon: Sparkles,
      title: "Acesse de Qualquer Lugar",
      description: "Busca instantânea na nuvem",
      gradient: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <section id="como-funciona" className="py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-gradient-primary/10 text-primary-blue rounded-full text-sm font-bold mb-4">
            COMO FUNCIONA
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Simples e <span className="bg-gradient-primary bg-clip-text">Rápido</span>
          </h2>
          <p className="text-xl text-gray-600">
            Comece em 3 passos
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              
              {/* Icon com badge */}
              <div className="relative inline-flex items-center justify-center mb-6">
                <div className={`w-32 h-32 bg-gradient-to-br ${step.gradient} rounded-3xl flex items-center justify-center shadow-lg hover:scale-105 transition-transform`}>
                  <step.icon className="w-16 h-16 text-white" />
                </div>
                <div className={`absolute -top-3 -right-3 w-12 h-12 ${step.bgColor} rounded-full border-4 border-white flex items-center justify-center shadow-md`}>
                  <span className={`text-2xl font-bold bg-gradient-to-br ${step.gradient} bg-clip-text text-transparent`}>
                    {step.number}
                  </span>
                </div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 text-lg">
                {step.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default HowItWorksSection;