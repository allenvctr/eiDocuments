"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      
      {/* Background com gradiente e elementos decorativos */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-white" />
      
      {/* Círculos coloridos decorativos */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse-slow" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        
        {/* Badge no topo */}
        <div className="inline-flex items-center space-x-2 px-5 py-2.5 bg-white rounded-full border-2 border-primary-blue/20 mb-8 shadow-lg">
          <Sparkles className="w-4 h-4 text-primary-blue" />
          <span className="font-bold text-sm text-primary-blue">Gestão Inteligente de Documentos</span>
        </div>

        {/* Slogan Principal */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
          <span className="text-gray-900">Organize.</span>
          <br />
          <span className="bg-gradient-primary bg-clip-text">Proteja.</span>
          <br />
          <span className="text-gray-900">Encontre.</span>
        </h1>

        {/* Subtítulo */}
        <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto">
          A solução completa para gestão de documentos da sua empresa.
        </p>

        {/* 3 benefícios com cores */}
        <div className="flex flex-wrap justify-center gap-6 mb-12">
          <div className="flex items-center space-x-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-900">Organização Total</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-900">Busca Instantânea</span>
          </div>
          <div className="flex items-center space-x-2 px-4 py-3 bg-purple-50 border border-purple-200 rounded-xl">
            <CheckCircle className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-900">Segurança Total</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
          <Link href="/register">
            <button className="group px-10 py-5 bg-gradient-primary text-white rounded-xl font-bold text-lg shadow-gradient hover:shadow-strong transition-all hover:scale-105 flex items-center space-x-2">
              <span>Começar Grátis</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Trust line */}
        <p className="text-sm text-gray-600">
          ✨ 14 dias grátis • Sem cartão de crédito • Cancele quando quiser
        </p>

      </div>
    </section>
  );
};

export default HeroSection;