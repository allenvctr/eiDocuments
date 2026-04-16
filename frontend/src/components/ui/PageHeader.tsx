"use client";

import React from 'react';
import ModernButton from './ModernButton';
import { Plus, Search, Filter } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  onSearch?: (query: string) => void;
  onFilter?: () => void;
  addButtonText?: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  showFilter?: boolean;
  showAdd?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  onAdd,
  onSearch,
  onFilter,
  addButtonText = "Adicionar",
  searchPlaceholder = "Pesquisar...",
  showSearch = true,
  showFilter = true,
  showAdd = true,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Title */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {showSearch && onSearch && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                onChange={(e) => onSearch(e.target.value)}
                className="
                  pl-10 pr-4 py-2 w-full sm:w-64
                  border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  dark:focus:ring-blue-400 dark:focus:border-blue-400
                  transition-colors
                "
              />
            </div>
          )}

          {showFilter && onFilter && (
            <ModernButton
              variant="outline"
              onClick={onFilter}
              className="flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
            </ModernButton>
          )}

          {showAdd && onAdd && (
            <ModernButton
              onClick={onAdd}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{addButtonText}</span>
            </ModernButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
