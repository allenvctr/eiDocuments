"use client";

import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface SearchFilterOption {
  value: string;
  label: string;
  color?: string;
}

export interface SearchFilterField {
  key: string;
  label: string;
  type: 'select' | 'daterange';
  options?: SearchFilterOption[];
  dataSource?: 'departamentos' | 'categorias' | 'tipos' | 'usuarios';
  placeholder?: string;
}

interface SearchFilterBarProps {
  // Optional header section (replaces PageHeader on document pages)
  title?: string;
  subtitle?: string;
  actionButton?: React.ReactNode;
  // Search
  searchValue: string;
  onSearchChange: (v: string) => void;
  onSearch?: () => void;
  searchPlaceholder?: string;
  // Show an explicit search button (use for pages where search is not live)
  showSearchButton?: boolean;
  // Called when the X (clear) button is clicked — use for non-live pages that need to reset state
  onClearSearch?: () => void;
  // Whether the filter panel starts open (default true for manage pages, pass false for user pages)
  defaultFiltersOpen?: boolean;
  // Filter fields config (passed by page, role-aware)
  filterFields: SearchFilterField[];
  // Current filter state
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  // Dynamic data for dropdowns
  departamentos?: Array<{ _id: string; nome: string }>;
  categorias?: Array<{ _id: string; nome: string; cor?: string }>;
  tipos?: Array<{ _id: string; nome: string }>;
  usuarios?: Array<{ _id: string; nome: string }>;
}

interface ActiveChip {
  keys: string[];
  fieldLabel: string;
  displayValue: string;
}

function resolveOptions(field: SearchFilterField, props: SearchFilterBarProps): SearchFilterOption[] {
  if (field.options) return field.options;
  switch (field.dataSource) {
    case 'departamentos':
      return (props.departamentos || []).map(d => ({ value: d._id, label: d.nome }));
    case 'categorias':
      return (props.categorias || []).map(c => ({ value: c._id, label: c.nome, color: c.cor }));
    case 'tipos':
      return (props.tipos || []).map(t => ({ value: t._id, label: t.nome }));
    case 'usuarios':
      return (props.usuarios || []).map(u => ({ value: u._id, label: u.nome }));
    default:
      return [];
  }
}

function buildChips(fields: SearchFilterField[], activeFilters: Record<string, string>, props: SearchFilterBarProps): ActiveChip[] {
  const chips: ActiveChip[] = [];

  for (const field of fields) {
    if (field.type === 'select') {
      const val = activeFilters[field.key];
      if (val) {
        const options = resolveOptions(field, props);
        const match = options.find(o => o.value === val);
        chips.push({ keys: [field.key], fieldLabel: field.label, displayValue: match?.label || val });
      }
    } else if (field.type === 'daterange') {
      const start = activeFilters[`${field.key}_start`];
      const end = activeFilters[`${field.key}_end`];
      if (start || end) {
        const fmt = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('pt-BR');
        const display =
          start && end ? `${fmt(start)} – ${fmt(end)}` :
          start ? `≥ ${fmt(start)}` :
          `≤ ${fmt(end!)}`;
        chips.push({ keys: [`${field.key}_start`, `${field.key}_end`], fieldLabel: field.label, displayValue: display });
      }
    }
  }

  return chips;
}

const selectClass =
  'block border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 ' +
  'text-gray-900 dark:text-gray-100 text-sm py-1.5 px-2.5 ' +
  'focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ' +
  'min-w-[150px] max-w-[200px]';

const dateClass =
  'block border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 ' +
  'text-gray-900 dark:text-gray-100 text-sm py-1.5 px-2.5 ' +
  'focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500 ' +
  'w-[138px]';

const SearchFilterBar: React.FC<SearchFilterBarProps> = (props) => {
  const {
    title, subtitle, actionButton,
    searchValue, onSearchChange, onSearch,
    searchPlaceholder = 'Pesquisar...',
    showSearchButton = false,
    defaultFiltersOpen = false,
    filterFields, activeFilters, onFilterChange, onClearFilters,
  } = props;

  const [showFilters, setShowFilters] = useState(defaultFiltersOpen);

  const chips = buildChips(filterFields, activeFilters, props);
  const activeCount = chips.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSearch?.();
  };

  const handleClearSearch = () => {
    onSearchChange('');
    props.onClearSearch?.();
  };

  const renderField = (field: SearchFilterField) => {
    if (field.type === 'select') {
      const options = resolveOptions(field, props);
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {field.label}
          </span>
          <select
            value={activeFilters[field.key] || ''}
            onChange={e => onFilterChange(field.key, e.target.value)}
            className={selectClass}
          >
            <option value="">{field.placeholder || 'Todos'}</option>
            {options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      );
    }

    if (field.type === 'daterange') {
      return (
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
            {field.label}
          </span>
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={activeFilters[`${field.key}_start`] || ''}
              onChange={e => onFilterChange(`${field.key}_start`, e.target.value)}
              className={dateClass}
            />
            <span className="text-gray-400 dark:text-gray-600 text-xs flex-shrink-0">–</span>
            <input
              type="date"
              value={activeFilters[`${field.key}_end`] || ''}
              onChange={e => onFilterChange(`${field.key}_end`, e.target.value)}
              className={dateClass}
            />
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg mb-6 overflow-hidden">

      {/* Header row: title + action button */}
      {(title || actionButton) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div>
            {title && (
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actionButton}
        </div>
      )}

      {/* Search row */}
      <div className="flex items-center gap-2 px-6 py-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
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
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
              aria-label="Limpar pesquisa"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showSearchButton && (
          <button
            onClick={onSearch}
            className="flex-shrink-0 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-md transition-colors"
          >
            Buscar
          </button>
        )}

        {/* Filters toggle — always visible */}
        {filterFields.length > 0 && (
          <button
            onClick={() => setShowFilters(v => !v)}
            className={`flex-shrink-0 relative flex items-center gap-1.5 px-3 py-2.5 border rounded-md text-sm font-medium transition-colors ${
              showFilters
                ? 'border-green-500 text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
            aria-label={showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filtros</span>
            {activeCount > 0 && (
              <span className="bg-green-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Filter row — desktop always visible, mobile toggleable */}
      {filterFields.length > 0 && showFilters && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
          <div className="px-6 py-3 flex flex-wrap items-end gap-x-5 gap-y-3">
            {filterFields.map(field => (
              <div key={field.key}>
                {renderField(field)}
              </div>
            ))}

            {activeCount > 0 && (
              <button
                onClick={onClearFilters}
                className="self-end pb-0.5 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              >
                <X className="w-3 h-3" />
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {chips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 px-6 py-2 border-t border-gray-100 dark:border-gray-700/50">
          {chips.map(chip => (
            <span
              key={chip.keys.join('+')}
              className="inline-flex items-center gap-1 pl-2.5 pr-1.5 py-0.5 rounded-full text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700"
            >
              <span className="text-green-500 dark:text-green-400 font-normal">{chip.fieldLabel}:</span>
              {chip.displayValue}
              <button
                onClick={() => chip.keys.forEach(k => onFilterChange(k, ''))}
                className="ml-0.5 hover:text-green-900 dark:hover:text-green-100 transition-colors"
                aria-label={`Remover filtro ${chip.fieldLabel}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
