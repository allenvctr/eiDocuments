"use client";

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Como funciona o período de teste gratuito?",
      answer: "Você tem 14 dias completos para testar todas as funcionalidades do eiDocuments sem pagar nada. Não pedimos cartão de crédito no cadastro. Após o período, você escolhe o plano que melhor se adequa à sua empresa."
    },
    {
      question: "É seguro armazenar documentos confidenciais?",
      answer: "Sim, totalmente seguro. Utilizamos criptografia de ponta a ponta, servidores seguros com certificação ISO 27001, backup automático diário e controle de acesso granular. Seus dados são protegidos com os mais altos padrões de segurança da indústria."
    },
    {
      question: "Posso personalizar o sistema para minha empresa?",
      answer: "Sim! O eiDocuments é altamente customizável. Você pode criar departamentos, categorias e tipos de documentos específicos para sua empresa. No plano Enterprise, oferecemos personalização completa incluindo branding, integrações e funcionalidades sob medida."
    },
    {
      question: "Como funciona o suporte técnico?",
      answer: "No plano Básico oferecemos suporte por email com resposta em até 24h. No plano Pro, suporte prioritário com resposta em até 4h. No Enterprise, você tem um gerente de conta dedicado, suporte 24/7 e SLA garantido."
    },
    {
      question: "Posso cancelar a qualquer momento?",
      answer: "Sim, sem multas ou taxas de cancelamento. Você pode cancelar seu plano a qualquer momento e terá acesso até o fim do período pago. Também oferecemos exportação completa dos seus dados antes do cancelamento."
    },
    {
      question: "Quantos documentos posso armazenar?",
      answer: "O limite depende do espaço de armazenamento do seu plano: Básico (10GB), Pro (100GB), ou customizado no Enterprise. Em média, 10GB suporta cerca de 5.000 documentos PDF. Documentos inativos podem ser arquivados sem contar no limite."
    },
    {
      question: "O sistema funciona em dispositivos móveis?",
      answer: "Sim! O eiDocuments é totalmente responsivo e funciona perfeitamente em smartphones e tablets. Você pode acessar, buscar e fazer download de documentos de qualquer dispositivo com internet."
    },
    {
      question: "Vocês oferecem treinamento para a equipe?",
      answer: "Sim. No plano Pro incluímos tutoriais em vídeo e documentação completa. No plano Enterprise oferecemos treinamento personalizado ao vivo para sua equipe, sessões de onboarding e suporte contínuo."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <span className="inline-block px-4 py-2 bg-gradient-primary/10 text-primary-blue rounded-full text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            Perguntas <span className="bg-gradient-primary bg-clip-text text-transparent">Frequentes</span>
          </h2>
          <p className="text-xl text-gray-600">
            Tire suas dúvidas sobre o eiDocuments
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className={`bg-white border-2 rounded-xl overflow-hidden transition-all duration-300 ${
                openIndex === index 
                  ? 'border-primary-blue shadow-soft' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Question */}
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4 flex-1">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    openIndex === index 
                      ? 'bg-gradient-primary' 
                      : 'bg-gray-100'
                  }`}>
                    <HelpCircle className={`w-5 h-5 ${
                      openIndex === index ? 'text-white' : 'text-gray-600'
                    }`} />
                  </div>
                  <span className={`text-lg font-semibold ${
                    openIndex === index ? 'text-primary-blue' : 'text-gray-900'
                  }`}>
                    {faq.question}
                  </span>
                </div>
                <ChevronDown 
                  className={`w-6 h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ml-4 ${
                    openIndex === index ? 'rotate-180 text-primary-blue' : ''
                  }`}
                />
              </button>

              {/* Answer */}
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-6 pl-20">
                  <p className="text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center bg-gradient-subtle rounded-2xl p-8 border-2 border-primary-blue/20">
          <p className="text-lg text-gray-700 mb-4 font-semibold">
            Ainda tem dúvidas?
          </p>
          <p className="text-gray-600 mb-6">
            Nossa equipe está pronta para ajudar você
          </p>
          <button className="px-8 py-3 bg-gradient-primary text-white rounded-xl font-bold shadow-gradient hover:shadow-strong transition-all hover:scale-105">
            Falar com Suporte
          </button>
        </div>

      </div>
    </section>
  );
};

export default FAQSection;