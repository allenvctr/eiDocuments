"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Facebook, Instagram, Linkedin } from 'lucide-react';

const LandingFooter = () => {
  return (
    <footer className="bg-gray-900 text-gray-400">
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          
          {/* Logo e descrição */}
          <div>
            <Link href="/" className="inline-flex items-center space-x-3 mb-4">
              <Image
                src="/logo-rush-tech.png"
                alt="Rush Tech"
                width={40}
                height={40}
              />
              <div>
                <h3 className="text-white font-bold">Rush Tech MZ</h3>
                <p className="text-sm text-gray-500">Soluções de Informática</p>
              </div>
            </Link>
            <p className="text-sm leading-relaxed">
              Gestão inteligente de documentos para empresas modernas.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-bold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#recursos" className="hover:text-white transition-colors">Recursos</a></li>
              <li><a href="#precos" className="hover:text-white transition-colors">Preços</a></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Entrar</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Criar Conta</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-white font-bold mb-4">Contato</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <a href="mailto:contato@rushtech.co.mz" className="hover:text-white transition-colors">
                  contato@rushtech.co.mz
                </a>
              </li>
              <li className="flex items-center space-x-3 mt-4">
                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-blue rounded-lg flex items-center justify-center transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-blue rounded-lg flex items-center justify-center transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-primary-blue rounded-lg flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-sm">
            © {new Date().getFullYear()} Rush Tech MZ. Todos os direitos reservados.
          </p>
        </div>
      </div>

    </footer>
  );
};

export default LandingFooter;