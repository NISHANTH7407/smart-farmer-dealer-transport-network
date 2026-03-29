import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp, ArrowDown } from 'lucide-react';
import Button from './Button';

const Table = ({ 
  columns, 
  data, 
  isLoading, 
  onSort, 
  sortField, 
  sortDirection,
  pagination = false,
  totalItems = 0,
  page = 1,
  pageSize = 10,
  onPageChange
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto' }}></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
        No data available
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="table-wrapper animate-fade-in">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th 
                key={col.key} 
                style={{ cursor: col.sortable ? 'pointer' : 'default', minWidth: col.width || 'auto' }}
                onClick={() => col.sortable && onSort && onSort(col.key)}
              >
                <div className="flex items-center gap-2">
                  {col.label}
                  {col.sortable && sortField === col.key && (
                    sortDirection === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={row.id || rowIndex}>
              {columns.map((col) => (
                <td key={`${row.id || rowIndex}-${col.key}`}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {pagination && totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '1rem',
          borderTop: '1px solid var(--border-color)' 
        }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalItems)} of {totalItems}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              disabled={page === 1} 
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <Button 
              variant="secondary" 
              disabled={page === totalPages} 
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
