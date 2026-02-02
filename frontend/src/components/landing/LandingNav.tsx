"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

/**
 * 🧭 LANDING NAV - Barra de Navegação da Landing Page
 * 
 * Funcionalidades:
 * - Logo clicável (volta ao topo)
 * - Links de navegação com scroll suave
 * - Botão "Entrar" para login
 * - Menu hambúrguer responsivo (mobile)
 * - Sticky (fixo ao rolar)
 * - Sombra dinâmica ao rolar
 */

interface NavLink {
  label: string;
  href: string;
}

const LandingNav = () => {
  // ===== ESTADOS =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // ===== LINKS DE NAVEGAÇÃO =====
  const navLinks: NavLink[] = [
    { label: 'Recursos', href: '#recursos' },
    { label: 'Como Funciona', href: '#como-funciona' },
    { label: 'Preços', href: '#precos' },
    { label: 'FAQ', href: '#faq' },
  ];

  // ===== EFEITO: DETECTAR SCROLL =====
  useEffect(() => {
    const handleScroll = () => {
      // Se rolou mais de 20px, adiciona sombra
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    
    // Cleanup: remover listener ao desmontar
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ===== FUNÇÃO: SCROLL SUAVE PARA SEÇÃO =====
  const scrollToSection = (href: string) => {
    // Fechar menu mobile
    setIsMenuOpen(false);

    // Se é uma âncora interna (#recursos)
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ 
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  };

  return (
    <nav 
      className={`
        fixed top-0 left-0 right-0 z-50 
        bg-gray-900 transition-shadow duration-300
        ${isScrolled ? 'shadow-xl' : 'shadow-lg'}
      `}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* ===== LOGO (ESQUERDA) ===== */}
          <Link 
            href="/"
            className="flex items-center space-x-3 group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            {/* Logo */}
            <div className="relative w-10 h-10 md:w-12 md:h-12">
              <Image
                src="/logo-rush-tech.png"
                alt="Rush Tech Logo"
                fill
                className="object-contain transition-transform duration-300 group-hover:scale-110"
                priority
              />
            </div>
            
            {/* Nome da empresa */}
            <div className="hidden sm:block">
              <h1 className="text-xl md:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Rush Tech MZ
              </h1>
              <p className="text-xs text-gray-500 -mt-1">
                Soluções de Informática
              </p>
            </div>
          </Link>

          {/* ===== LINKS DE NAVEGAÇÃO (CENTRO - DESKTOP) ===== */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-gray-300 hover:text-white font-medium transition-colors duration-200 relative group"
              >
                {link.label}
                
                {/* Underline animado no hover */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-primary group-hover:w-full transition-all duration-300" />
              </button>
            ))}
          </div>

          {/* ===== BOTÃO ENTRAR (DIREITA - DESKTOP) ===== */}
          <div className="hidden md:block">
            <Link href="/login">
              <button className="bg-gradient-primary text-white px-6 py-2.5 rounded-lg font-semibold shadow-soft hover:shadow-strong transition-all duration-300 hover:scale-105">
                Entrar
              </button>
            </Link>
          </div>

          {/* ===== BOTÃO MENU HAMBÚRGUER (MOBILE) ===== */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>
      </div>

      {/* ===== MENU MOBILE (DROPDOWN) ===== */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 border-t border-gray-700 shadow-lg animate-slide-down">
          <div className="px-4 py-4 space-y-3">
            {/* Links */}
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white font-medium rounded-lg transition-colors"
              >
                {link.label}
              </button>
            ))}
            
            {/* Botão Entrar (mobile) */}
            <Link href="/login" className="block">
              <button 
                className="w-full bg-gradient-primary text-white px-4 py-3 rounded-lg font-semibold shadow-soft hover:shadow-medium transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                Entrar
              </button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
