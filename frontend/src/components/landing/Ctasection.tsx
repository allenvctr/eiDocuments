"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const CTASection = () => {
  return (
    <section className="py-32 bg-gradient-primary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          Pronto para Começar?
        </h2>
        
        <p className="text-xl text-white/90 mb-10">
          Teste grátis por 14 dias. Sem compromisso.
        </p>

        <Link href="/register">
          <button className="group px-10 py-5 bg-white text-primary-blue rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all hover:scale-105 inline-flex items-center space-x-2">
            <span>Criar Conta Grátis</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </Link>

      </div>
    </section>
  );
};

export default CTASection;