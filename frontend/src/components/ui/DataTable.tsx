"use client";

import React from 'react';
import { createPortal } from 'react-dom';
import { MoreVertical, Edit, Trash2, Eye } from 'lucide-react';
import ModernButton from './ModernButton';
import TablePagination from './TablePagination';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  render?: (value: any, record: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  ellipsis?: boolean; // Nova propriedade para truncar texto com ...
  maxWidth?: string; // Largura máxima para ellipsis
}

export interface TableAction<T = any> {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (record: T) => void;
  variant?: 'default' | 'danger' | 'success' | 'warning';
}

interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  actions?: TableAction<T>[];
  loading?: boolean;
  emptyMessage?: string | React.ReactNode;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  className?: string;
  // Propriedades de paginação
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    showItemsPerPage?: boolean;
    itemsPerPageOptions?: number[];
  };
}

const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  loading = false,
  emptyMessage = "Nenhum item encontrado",
  onSort,
  className = "",
  pagination,
}: DataTableProps<T>) => {
  const [sortColumn, setSortColumn] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = React.useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = React.useState({ x: 0, y: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Garantir que o componente foi montado (para evitar problemas de SSR)
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Fechar dropdown quando clicar fora ou rolar
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Verificar se o clique não foi no dropdown nem no botão
      if (openDropdown !== null && 
          !target.closest('[data-dropdown]') && 
          !target.closest('[data-dropdown-button]')) {
        setOpenDropdown(null);
      }
    };

    const handleScroll = () => {
      if (openDropdown !== null) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown !== null) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [openDropdown]);

  const handleSort = (column: TableColumn<T>) => {
    if (!column.sortable) return;

    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column.key);
    setSortDirection(newDirection);
    onSort?.(column.key, newDirection);
  };

  const defaultActions: TableAction<T>[] = [
    {
      key: 'view',
      label: 'Visualizar',
      icon: <Eye className="w-4 h-4" />,
      onClick: (record) => console.log('View', record),
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <Edit className="w-4 h-4" />,
      onClick: (record) => console.log('Edit', record),
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (record) => console.log('Delete', record),
      variant: 'danger' as const,
    },
  ];

  // Se actions for explicitamente um array vazio, não mostrar nenhuma ação
  // Se actions for undefined, usar defaultActions
  const allActions = actions !== undefined 
    ? actions 
    : defaultActions;

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
        <div className="p-8 text-center">
          {typeof emptyMessage === 'string' ? (
            <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          ) : (
            emptyMessage
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-6 py-3 text-left text-xs font-medium
                    text-gray-500 dark:text-gray-400
                    uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800' : ''}
                    ${column.width ? column.width : ''}
                  `}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.title}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <span className={`text-xs ${
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>▲</span>
                        <span className={`text-xs ${
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-400 dark:text-gray-600'
                        }`}>▼</span>
                      </div>
                    )}
                  </div>
                </th>
              ))}
              {allActions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Ações
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.map((record, index) => (
              <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-6 py-4 text-gray-900 dark:text-gray-100 ${column.ellipsis ? '' : 'whitespace-nowrap'}`}
                    style={column.ellipsis ? { maxWidth: column.maxWidth || '300px' } : undefined}
                  >
                    {column.ellipsis ? (
                      <div
                        className="overflow-hidden text-ellipsis whitespace-nowrap"
                        title={String(record[column.key] || '')}
                      >
                        {column.render
                          ? column.render(record[column.key], record)
                          : record[column.key]
                        }
                      </div>
                    ) : (
                      <>
                        {column.render
                          ? column.render(record[column.key], record)
                          : record[column.key]
                        }
                      </>
                    )}
                  </td>
                ))}
                {allActions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="relative inline-block">
                      <button
                        data-dropdown-button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (openDropdown === index) {
                            setOpenDropdown(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const dropdownWidth = 192;
                            const dropdownHeight = 160;
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const x = rect.right - dropdownWidth < 8
                              ? Math.max(8, rect.left)
                              : rect.right - dropdownWidth;
                            const y = spaceBelow < dropdownHeight
                              ? rect.top - dropdownHeight - 4
                              : rect.bottom + 4;
                            setDropdownPosition({ x, y });
                            setOpenDropdown(index);
                          }
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      {pagination && (
        <TablePagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
          showItemsPerPage={pagination.showItemsPerPage}
          itemsPerPageOptions={pagination.itemsPerPageOptions}
        />
      )}

      {/* Portal dropdown */}
      {mounted && openDropdown !== null && createPortal(
        <div
          data-dropdown
          className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-[9999]"
          style={{
            left: dropdownPosition.x,
            top: dropdownPosition.y,
          }}
        >
          {allActions.map((action) => (
            <button
              key={action.key}
              onClick={() => {
                action.onClick(data[openDropdown]);
                setOpenDropdown(null);
              }}
              className={`
                w-full px-4 py-2 text-left text-sm flex items-center space-x-2
                transition-colors first:rounded-t-lg last:rounded-b-lg
                ${action.variant === 'danger'
                  ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                }
              `}
            >
              {action.icon}
              <span>{action.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

export default DataTable;
