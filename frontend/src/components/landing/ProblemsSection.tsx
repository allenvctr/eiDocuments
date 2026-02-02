"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Shield, Search, FolderCheck } from 'lucide-react';


const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30">
      
      {/* ===== ELEMENTOS DECORATIVOS DE FUNDO ===== */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Círculo azul (topo direita) */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-blue/10 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Círculo roxo (inferior esquerda) */}
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-purple/10 rounded-full blur-3xl animate-pulse-slow" />
        
        {/* Grid pattern sutil */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1E90FF 1px, transparent 1px),
              linear-gradient(to bottom, #1E90FF 1px, transparent 1px)
            `,
            backgroundSize: '4rem 4rem'
          }}
        />
      </div>

      {/* ===== CONTEÚDO PRINCIPAL ===== */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="text-center space-y-8 md:space-y-12">
          
          {/* ===== BADGE (OPCIONAL) ===== */}
          <div className="animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-primary/10 text-primary-blue text-sm font-semibold border border-primary-blue/20">
              <span className="w-2 h-2 bg-primary-blue rounded-full mr-2 animate-pulse" />
              Gestão Inteligente de Documentos
            </span>
          </div>

          {/* ===== TÍTULO PRINCIPAL (H1) ===== */}
          <h1 className="animate-slide-up">
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight">
              Organize.
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold bg-gradient-primary bg-clip-text text-transparent leading-tight">
              Proteja.
            </span>
            <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-gray-900 leading-tight">
              Encontre.
            </span>
          </h1>

          {/* ===== SUBTÍTULO ===== */}
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-600 leading-relaxed animate-slide-up delay-100">
            Acabe com a <span className="font-semibold text-gray-900">desorganização</span> de documentos, 
            <span className="font-semibold text-gray-900"> dificuldade de busca</span> e 
            <span className="font-semibold text-gray-900"> insegurança</span> dos dados.
            <br />
            <span className="text-primary-blue font-semibold">
              eiDocuments é a solução completa para sua empresa.
            </span>
          </p>

          {/* ===== ÍCONES DOS 3 PROBLEMAS RESOLVIDOS ===== */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 animate-slide-up delay-200">
            {/* Organização */}
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
              <div className="w-10 h-10 bg-gradient-primary/10 rounded-lg flex items-center justify-center">
                <FolderCheck className="w-5 h-5 text-primary-blue" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Organização</span>
            </div>

            {/* Busca Rápida */}
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
              <div className="w-10 h-10 bg-gradient-primary/10 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-primary-blue" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Busca Rápida</span>
            </div>

            {/* Segurança */}
            <div className="flex items-center space-x-2 bg-white px-4 py-3 rounded-xl shadow-soft hover:shadow-medium transition-shadow">
              <div className="w-10 h-10 bg-gradient-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary-blue" />
              </div>
              <span className="text-sm font-semibold text-gray-700">Segurança</span>
            </div>
          </div>

          {/* ===== BOTÕES DE AÇÃO (CTAs) ===== */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up delay-300">
            {/* CTA Principal: Começar Grátis */}
            <Link href="/register">
              <button className="group w-full sm:w-auto px-8 py-4 bg-gradient-primary text-white rounded-xl font-bold text-lg shadow-gradient hover:shadow-strong transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2">
                <span>Começar Grátis</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>

            {/* CTA Secundário: Ver Demo */}
            <button className="group w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-xl font-bold text-lg shadow-soft hover:shadow-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2 border-2 border-gray-200 hover:border-primary-blue">
              <Play className="w-5 h-5 text-primary-blue" />
              <span>Ver Demo</span>
            </button>
          </div>

          {/* ===== TEXTO DE CONFIANÇA ===== */}
          <p className="text-sm text-gray-500 animate-fade-in delay-500">
            ✨ Sem cartão de crédito • 14 dias grátis • Cancele quando quiser
          </p>

          {/* ===== IMAGEM/PREVIEW DO DASHBOARD (PLACEHOLDER) ===== */}
          <div className="mt-16 animate-scale-in delay-700">
            <div className="relative max-w-5xl mx-auto">
              {/* Sombra decorativa */}
              <div className="absolute inset-0 bg-gradient-primary blur-3xl opacity-20 rounded-3xl" />
              
              {/* Container da imagem */}
              <div className="relative bg-white rounded-2xl shadow-strong p-2 border border-gray-200">
                {/* Barra de janela fake */}
                <div className="flex items-center space-x-2 px-4 py-3 bg-gray-50 rounded-t-xl border-b border-gray-200">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 text-xs text-gray-500 font-medium">
                    app.eidocuments.com
                  </div>
                </div>
                
                {/* Placeholder para imagem do dashboard */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-b-xl aspect-video flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto bg-gradient-primary/10 rounded-2xl flex items-center justify-center">
                      <FolderCheck className="w-10 h-10 text-primary-blue" />
                    </div>
                    <div>
                      <p className="text-gray-400 font-semibold text-lg">
                        Preview do Dashboard
                      </p>
                      <p className="text-gray-300 text-sm">
                        (Substitua por screenshot real)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== SCROLL INDICATOR (SETA PARA BAIXO) ===== */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-gradient-primary rounded-full animate-pulse" />
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
