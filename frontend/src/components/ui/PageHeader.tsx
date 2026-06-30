"use client";

import React from 'react';
import ModernButton from './ModernButton';
import { Plus, Search, Filter, X } from 'lucide-react';

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
  // Optional: show a count badge on the filter button
  activeFilterCount?: number;
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
  activeFilterCount = 0,
}) => {
  const [searchValue, setSearchValue] = React.useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    onSearch?.('');
  };

  const hasSearch = showSearch && onSearch;
  const hasFilter = showFilter && onFilter;
  const hasAdd = showAdd && onAdd;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 overflow-hidden">
      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          )}
        </div>

        {hasAdd && (
          <ModernButton onClick={onAdd} size="sm" className="flex items-center gap-1.5 self-start sm:self-auto">
            <Plus className="w-4 h-4" />
            <span>{addButtonText}</span>
          </ModernButton>
        )}
      </div>

      {/* Search row — only rendered when search is enabled */}
      {(hasSearch || hasFilter) && (
        <div className="flex items-center gap-2 px-6 pb-4">
          {hasSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                type="text"
                value={searchValue}
                placeholder={searchPlaceholder}
                onChange={handleChange}
                className="
                  w-full pl-9 pr-9 py-2.5
                  border border-gray-300 dark:border-gray-600
                  rounded-md bg-white dark:bg-gray-700
                  text-gray-900 dark:text-gray-100
                  placeholder-gray-400 dark:placeholder-gray-500
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                  transition-colors
                "
              />
              {searchValue && (
                <button
                  onClick={handleClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  aria-label="Limpar pesquisa"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {hasFilter && (
            <button
              onClick={onFilter}
              className="relative flex-shrink-0 flex items-center gap-1.5 px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span>Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PageHeader;
