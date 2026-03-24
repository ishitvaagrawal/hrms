import React from 'react';
import Button from './Button';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
  totalItems?: number;
  hidePageSizeToggle?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalItems,
  hidePageSizeToggle = false,
}) => {
  if (totalPages <= 1 && (totalItems === undefined || totalItems <= pageSize)) return null;

  const showStats = totalItems !== undefined && !hidePageSizeToggle;
  const showPageSize = onPageSizeChange !== undefined && !hidePageSizeToggle;

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 py-6 px-2 ${hidePageSizeToggle ? 'sm:justify-center' : ''}`}>
      {showStats && (
        <div className="text-sm text-gray-500 font-medium italic">
          Showing <span className="text-gray-900 font-bold">{Math.min(totalItems!, (currentPage - 1) * pageSize + 1)}</span> to{' '}
          <span className="text-gray-900 font-bold">{Math.min(totalItems!, currentPage * pageSize)}</span> of{' '}
          <span className="text-gray-900 font-bold">{totalItems}</span> results
        </div>
      )}

      <div className="flex items-center gap-4">
        {showPageSize && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange!(Number(e.target.value))}
              className="bg-white border border-gray-100 rounded-lg text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-700"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <Button
            variant="secondary"
            className="px-3 py-1 text-xs"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Prev
          </Button>
          
          <div className="flex items-center gap-1 px-4">
            <span className="text-sm font-black text-blue-600">{currentPage}</span>
            <span className="text-sm font-medium text-gray-300">/</span>
            <span className="text-sm font-medium text-gray-500">{totalPages}</span>
          </div>

          <Button
            variant="secondary"
            className="px-3 py-1 text-xs"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
