import React from 'react';
import Button from '@/components/ui/Button';

interface DirectoryActionsProps {
  selectedCount: number;
  totalCount: number;
  selectedDate: string;
  isActionLoading: boolean;
  onSelectAll: (checked: boolean) => void;
  onDateChange: (date: string) => void;
  onBulkMark: (status: 'Present' | 'Absent') => void;
  onBulkDelete: () => void;
}

const DirectoryActions: React.FC<DirectoryActionsProps> = ({
  selectedCount,
  totalCount,
  selectedDate,
  isActionLoading,
  onSelectAll,
  onDateChange,
  onBulkMark,
  onBulkDelete
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-20 z-10">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-3">
          <input 
            type="checkbox" 
            onChange={(e) => onSelectAll(e.target.checked)} 
            checked={totalCount > 0 && selectedCount === totalCount}
            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select All</span>
        </div>

        <div className="h-8 w-px bg-gray-100 hidden sm:block" />

        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <input 
              type="date" 
              value={selectedDate}
              max={today}
              onChange={(e) => onDateChange(e.target.value)}
              className="block w-36 text-sm font-bold border-none bg-transparent focus:ring-0 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {selectedCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">{selectedCount} Selected</span>
          <Button 
            variant="primary" 
            className="bg-green-600 hover:bg-green-700 px-4 py-1.5 text-xs font-black tracking-widest uppercase"
            onClick={() => onBulkMark('Present')}
            loading={isActionLoading}
          >
            Mark Present
          </Button>
          <Button 
            variant="danger" 
            className="bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-black tracking-widest uppercase"
            onClick={() => onBulkMark('Absent')}
            loading={isActionLoading}
          >
            Mark Absent
          </Button>
          <Button 
            variant="ghost" 
            className="text-red-600 hover:bg-red-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase border border-transparent hover:border-red-100"
            onClick={onBulkDelete}
            loading={isActionLoading}
          >
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default DirectoryActions;
