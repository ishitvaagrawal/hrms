import React from 'react';

interface Column<T> {
  header: React.ReactNode;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

const Table = <T extends { id: string | number }>({ 
  data, 
  columns, 
  loading = false, 
  emptyMessage = 'No data found',
  onRowClick
}: TableProps<T>) => {
  if (loading) {
    return (
      <div className="w-full flex justify-center items-center py-20 bg-white rounded-xl border border-gray-100">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full text-center py-20 bg-white rounded-xl border border-gray-100 text-gray-500 italic">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-xl border border-gray-100 shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th 
                  key={index}
                  className={`px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider ${column.className || ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {data.map((item) => (
              <tr 
                key={item.id}
                onClick={() => onRowClick && onRowClick(item)}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-all duration-150`}
              >
                {columns.map((column, index) => (
                  <td 
                    key={index}
                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                  >
                    {typeof column.accessor === 'function' 
                      ? column.accessor(item) 
                      : (item[column.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;
