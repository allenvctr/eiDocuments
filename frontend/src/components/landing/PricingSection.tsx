"use client";

import React from 'react';
import { Check, Star, Zap, Building2 } from 'lucide-react';

const PricingSection = () => {
  const plans = [
    {
      name: "Básico",
      price: "2.500",
      icon: Star,
      gradient: "from-blue-500 to-cyan-500",
      features: [
        "5 usuários",
        "10GB storage",
        "2 departamentos",
        "Suporte email"
      ]
    },
    {
      name: "Pro",
      price: "7.500",
      popular: true,
      icon: Zap,
      gradient: "from-purple-500 to-pink-500",
      features: [
        "20 usuários",
        "100GB storage",
        "10 departamentos",
        "Suporte prioritário",
        "Relatórios avançados"
      ]
    },
    {
      name: "Enterprise",
      price: "Personalizado",
      icon: Building2,
      gradient: "from-green-500 to-emerald-500",
      features: [
        "Usuários ilimitados",
        "Storage customizado",
        "API de integração",
        "Gerente dedicado"
      ]
    }
  ];

  return (
    <section id="precos" className="py-32 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-2 bg-gradient-primary/10 text-primary-blue rounded-full text-sm font-bold mb-4">
            PREÇOS
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Planos <span className="bg-gradient-primary bg-clip-text">Transparentes</span>
          </h2>
          <p className="text-xl text-gray-600">
            14 dias grátis em todos os planos
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white rounded-3xl p-8 transition-all ${
                plan.popular 
                  ? 'ring-4 ring-purple-200 shadow-xl scale-105' 
                  : 'shadow-md hover:shadow-lg'
              }`}
            >
              
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className={`px-4 py-2 bg-gradient-to-r ${plan.gradient} rounded-full text-white text-sm font-bold shadow-lg flex items-center space-x-1`}>
                    <Star className="w-4 h-4 fill-white" />
                    <span>MAIS POPULAR</span>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div className={`w-16 h-16 bg-gradient-to-br ${plan.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-md`}>
                <plan.icon className="w-8 h-8 text-white" />
              </div>

              {/* Header */}
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {plan.name}
                </h3>
                {plan.price === "Personalizado" ? (
                  <div className="text-3xl font-bold text-gray-900">
                    {plan.price}
                  </div>
                ) : (
                  <div className="flex items-baseline">
                    <span className="text-gray-600 mr-1">MT</span>
                    <span className={`text-5xl font-bold bg-gradient-to-br ${plan.gradient} bg-clip-text text-transparent`}>
                      {plan.price}
                    </span>
                    <span className="text-gray-600 ml-1">/mês</span>
                  </div>
                )}
              </div>

              {/* Features */}
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <div className={`w-6 h-6 bg-gradient-to-br ${plan.gradient} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button 
                className={`w-full py-4 rounded-xl font-bold transition-all ${
                  plan.popular
                    ? `bg-gradient-to-r ${plan.gradient} text-white shadow-lg hover:shadow-xl hover:scale-105`
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Começar
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default PricingSection;