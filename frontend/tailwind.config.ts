// @ts-ignore
import type { Config } from "tailwindcss";

/**
 * 🎨 TAILWIND CONFIG - RUSH TECH
 * 
 * Configuração personalizada do Tailwind CSS com:
 * - Cores da marca Rush Tech
 * - Gradientes do logo
 * - Animações para landing page
 * - Sombras personalizadas
 */

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // ===== CORES PERSONALIZADAS DA RUSH TECH =====
      colors: {
        // Cores primárias (do logo)
        'primary-blue': '#1E90FF',
        'primary-purple': '#9D4EDD',
        'primary-dark': '#0A1628',
        
        // Cores de estado
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#F59E0B',
        'info': '#06B6D4',

        // Backgrounds
        'bg-light': '#F8FAFC',
        'bg-dark': '#0A1628',
      },

      // ===== GRADIENTES =====
      backgroundImage: {
        // Gradiente principal (azul → roxo) como no logo
        'gradient-primary': 'linear-gradient(135deg, #1E90FF 0%, #9D4EDD 100%)',
        
        // Gradiente invertido
        'gradient-primary-reverse': 'linear-gradient(135deg, #9D4EDD 0%, #1E90FF 100%)',
        
        // Gradiente sutil para seções
        'gradient-subtle': 'linear-gradient(135deg, rgba(30, 144, 255, 0.1) 0%, rgba(157, 78, 221, 0.1) 100%)',
        
        // Gradiente escuro para hero
        'gradient-dark': 'linear-gradient(135deg, #0A1628 0%, #1E293B 100%)',
        
        // Gradiente com transparência para overlays
        'gradient-overlay': 'linear-gradient(180deg, rgba(10, 22, 40, 0) 0%, rgba(10, 22, 40, 0.8) 100%)',
      },

      // ===== ANIMAÇÕES PERSONALIZADAS =====
      animation: {
        // Fade in (aparecer suavemente)
        'fade-in': 'fadeIn 0.6s ease-in-out',
        
        // Slide up (deslizar de baixo para cima)
        'slide-up': 'slideUp 0.6s ease-out',
        
        // Slide down (deslizar de cima para baixo)
        'slide-down': 'slideDown 0.6s ease-out',
        
        // Scale in (crescer do centro)
        'scale-in': 'scaleIn 0.5s ease-out',
        
        // Float (flutuação suave)
        'float': 'float 3s ease-in-out infinite',
        
        // Pulse lento (pulsação suave)
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        
        // Gradient animation (animação de gradiente)
        'gradient': 'gradient 8s ease infinite',
      },

      // ===== KEYFRAMES DAS ANIMAÇÕES =====
      keyframes: {
        // Fade in
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        
        // Slide up
        slideUp: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(30px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        
        // Slide down
        slideDown: {
          '0%': { 
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          '100%': { 
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
        
        // Scale in
        scaleIn: {
          '0%': { 
            opacity: '0',
            transform: 'scale(0.9)',
          },
          '100%': { 
            opacity: '1',
            transform: 'scale(1)',
          },
        },
        
        // Float
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        
        // Gradient animation
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },

      // ===== SOMBRAS PERSONALIZADAS =====
      boxShadow: {
        // Sombra suave
        'soft': '0 2px 15px rgba(30, 144, 255, 0.1)',
        
        // Sombra média
        'medium': '0 4px 20px rgba(30, 144, 255, 0.15)',
        
        // Sombra forte
        'strong': '0 8px 30px rgba(30, 144, 255, 0.2)',
        
        // Sombra com cor do gradiente
        'gradient': '0 10px 40px rgba(30, 144, 255, 0.3)',
        
        // Sombra interna
        'inner-soft': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
      },

      // ===== ESPAÇAMENTOS ADICIONAIS =====
      spacing: {
        '18': '4.5rem',   // 72px
        '88': '22rem',    // 352px
        '100': '25rem',   // 400px
        '112': '28rem',   // 448px
        '128': '32rem',   // 512px
      },

      // ===== BORDAS ARREDONDADAS =====
      borderRadius: {
        '4xl': '2rem',    // 32px
        '5xl': '2.5rem',  // 40px
      },

      // ===== TIPOGRAFIA =====
      fontSize: {
        // Tamanhos adicionais para hero sections
        '7xl': '5rem',      // 80px
        '8xl': '6rem',      // 96px
        '9xl': '8rem',      // 128px
      },

      // ===== BREAKPOINTS CUSTOMIZADOS =====
      screens: {
        'xs': '475px',     // Extra small devices
        '3xl': '1920px',   // Extra large screens
      },
    },
  },
  plugins: [],
};

export default config;

/**
 * 💡 COMO USAR AS CORES:
 * 
 * // Background
 * <div className="bg-primary-blue">
 * 
 * // Texto
 * <h1 className="text-primary-purple">
 * 
 * // Border
 * <div className="border-primary-blue">
 * 
 * // Hover
 * <button className="bg-primary-blue hover:bg-primary-purple">
 */

/**
 * 💡 COMO USAR OS GRADIENTES:
 * 
 * // Gradiente como background
 * <div className="bg-gradient-primary">
 * 
 * // Gradiente com texto
 * <h1 className="bg-gradient-primary bg-clip-text text-transparent">
 */

/**
 * 💡 COMO USAR AS ANIMAÇÕES:
 * 
 * // Fade in
 * <div className="animate-fade-in">
 * 
 * // Slide up
 * <div className="animate-slide-up">
 * 
 * // Float (loop infinito)
 * <div className="animate-float">
 * 
 * // Delay nas animações
 * <div className="animate-slide-up delay-100">
 * <div className="animate-slide-up delay-200">
 */

/**
 * 💡 COMO USAR AS SOMBRAS:
 * 
 * // Sombra suave
 * <div className="shadow-soft">
 * 
 * // Sombra com gradiente
 * <div className="shadow-gradient">
 * 
 * // Hover com sombra
 * <div className="shadow-soft hover:shadow-strong transition-shadow">
 */