"use client";

import React, { useState } from 'react';
import UserLayout from '@/components/ui/UserLayout';
import { User, Lock, Bell, Settings, Eye, EyeOff, Save, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

const inputClass = "block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
const inputDisabledClass = "block w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2";
const hintClass = "text-xs text-gray-500 dark:text-gray-400 mt-1";
const sectionTitleClass = "text-lg font-medium text-gray-900 dark:text-gray-100 mb-4";

const ConfiguracoesPage = () => {
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('perfil');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [perfilData, setPerfilData] = useState({
    nome: 'João Silva',
    apelido: 'João',
    username: 'joao.silva',
    email: 'joao.silva@empresa.com',
    departamento: 'Recursos Humanos'
  });

  const [senhaData, setSenhaData] = useState({
    senhaAtual: '',
    novaSenha: '',
    confirmarSenha: ''
  });

  const [notificacoes, setNotificacoes] = useState({
    emailNovoDocumento: true,
    emailMovimento: false,
    emailSemanal: true,
    notificacoesPush: true
  });

  const tabs = [
    { id: 'perfil', label: 'Perfil', icon: User },
    { id: 'senha', label: 'Senha', icon: Lock },
    { id: 'notificacoes', label: 'Notificações', icon: Bell },
    { id: 'preferencias', label: 'Preferências', icon: Settings }
  ];

  const handlePerfilSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Atualizar perfil:', perfilData);
  };

  const handleSenhaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (senhaData.novaSenha !== senhaData.confirmarSenha) {
      alert('As senhas não coincidem');
      return;
    }
    console.log('Alterar senha');
    setSenhaData({ senhaAtual: '', novaSenha: '', confirmarSenha: '' });
  };

  const handleNotificacoesSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Atualizar notificações:', notificacoes);
  };

  const renderPerfilTab = () => (
    <form onSubmit={handlePerfilSubmit} className="space-y-6">
      <div>
        <h3 className={sectionTitleClass}>Informações Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={labelClass}>Nome Completo</label>
            <input
              type="text"
              value={perfilData.nome}
              onChange={(e) => setPerfilData({ ...perfilData, nome: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Apelido</label>
            <input
              type="text"
              value={perfilData.apelido}
              onChange={(e) => setPerfilData({ ...perfilData, apelido: e.target.value })}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Username</label>
            <input
              type="text"
              value={perfilData.username}
              disabled
              className={inputDisabledClass}
            />
            <p className={hintClass}>O username não pode ser alterado</p>
          </div>

          <div>
            <label className={labelClass}>Email</label>
            <input
              type="email"
              value={perfilData.email}
              disabled
              className={inputDisabledClass}
            />
            <p className={hintClass}>Entre em contato com o administrador para alterar o email</p>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Departamento</label>
            <input
              type="text"
              value={perfilData.departamento}
              disabled
              className={inputDisabledClass}
            />
            <p className={hintClass}>Entre em contato com o administrador para alterar o departamento</p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Salvar Alterações
        </button>
      </div>
    </form>
  );

  const renderSenhaTab = () => (
    <form onSubmit={handleSenhaSubmit} className="space-y-6">
      <div>
        <h3 className={sectionTitleClass}>Alterar Senha</h3>
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Senha Atual</label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={senhaData.senhaAtual}
                onChange={(e) => setSenhaData({ ...senhaData, senhaAtual: e.target.value })}
                className={`${inputClass} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword
                  ? <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  : <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                }
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass}>Nova Senha</label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={senhaData.novaSenha}
                onChange={(e) => setSenhaData({ ...senhaData, novaSenha: e.target.value })}
                className={`${inputClass} pr-10`}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword
                  ? <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  : <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                }
              </button>
            </div>
            <p className={hintClass}>Mínimo de 6 caracteres</p>
          </div>

          <div>
            <label className={labelClass}>Confirmar Nova Senha</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={senhaData.confirmarSenha}
                onChange={(e) => setSenhaData({ ...senhaData, confirmarSenha: e.target.value })}
                className={`${inputClass} pr-10`}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword
                  ? <EyeOff className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  : <Eye className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Lock className="w-4 h-4 mr-2" />
          Alterar Senha
        </button>
      </div>
    </form>
  );

  const renderNotificacoesTab = () => (
    <form onSubmit={handleNotificacoesSubmit} className="space-y-6">
      <div>
        <h3 className={sectionTitleClass}>Preferências de Notificação</h3>
        <div className="space-y-4">
          {[
            { key: 'emailNovoDocumento', label: 'Novos documentos', desc: 'Receber email quando novos documentos forem adicionados' },
            { key: 'emailMovimento', label: 'Movimentos de documentos', desc: 'Notificar sobre alterações de status dos documentos' },
            { key: 'emailSemanal', label: 'Resumo semanal', desc: 'Receber resumo semanal de atividades' },
            { key: 'notificacoesPush', label: 'Notificações push', desc: 'Receber notificações no navegador' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notificacoes[key as keyof typeof notificacoes]}
                  onChange={(e) => setNotificacoes({ ...notificacoes, [key]: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          <Bell className="w-4 h-4 mr-2" />
          Salvar Preferências
        </button>
      </div>
    </form>
  );

  const themeOptions = [
    { value: 'light', label: 'Claro', icon: Sun, desc: 'Interface com fundo branco' },
    { value: 'dark', label: 'Escuro', icon: Moon, desc: 'Interface com fundo escuro' },
  ] as const;

  const renderPreferenciasTab = () => (
    <div className="space-y-6">
      <div>
        <h3 className={sectionTitleClass}>Preferências do Sistema</h3>

        {/* Theme toggle */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Tema da interface</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themeOptions.map(({ value, label, icon: Icon, desc }) => {
              const active = theme === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setTheme(value)}
                  className={`
                    flex items-center gap-4 p-4 rounded-lg border-2 text-left transition-colors
                    ${active
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                    }
                  `}
                >
                  <div className={`p-2 rounded-lg ${active ? 'bg-blue-100 dark:bg-blue-800/50' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    <Icon className={`w-5 h-5 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${active ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-gray-100'}`}>
                      {label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
                  </div>
                  {active && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-blue-500 dark:bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            A preferência de tema é salva automaticamente no seu navegador.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <UserLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Configurações</h1>
          <p className="text-gray-600 dark:text-gray-400">Gerencie suas configurações pessoais e preferências</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'perfil' && renderPerfilTab()}
            {activeTab === 'senha' && renderSenhaTab()}
            {activeTab === 'notificacoes' && renderNotificacoesTab()}
            {activeTab === 'preferencias' && renderPreferenciasTab()}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ConfiguracoesPage;
