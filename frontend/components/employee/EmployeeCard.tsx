import React from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Employee, AttendanceStatus } from '@/types';

interface EmployeeCardProps {
  employee: Employee;
  status?: AttendanceStatus;
  summary: { Present: number; Absent: number };
  isSelected: boolean;
  isMarked: boolean;
  isActionLoading: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onMarkAttendance: (id: string, status: AttendanceStatus) => void;
  onClick: () => void;
}

const EmployeeCard: React.FC<EmployeeCardProps> = ({
  employee,
  status,
  summary,
  isSelected,
  isMarked,
  isActionLoading,
  onSelect,
  onDelete,
  onMarkAttendance,
  onClick
}) => {
  return (
    <Card 
      className={`relative group border-2 transition-all duration-300 cursor-pointer ${
        isSelected ? 'border-blue-500 bg-blue-50/5 shadow-md' : 'border-transparent hover:border-gray-200'
      }`}
      onClick={onClick}
    >
      <div className="absolute top-4 right-4 z-10 flex gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <Button 
          variant="ghost" 
          className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl"
          onClick={(e) => { 
            e.stopPropagation(); 
            onDelete(employee.id); 
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>

      <div className="flex gap-4 px-1 py-1">
        <div className="pt-1">
          <input 
            type="checkbox" 
            checked={isSelected}
            onClick={(e) => e.stopPropagation()}
            onChange={() => onSelect(employee.id)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
        </div>
        
        <div className="flex-grow space-y-3">
          <div className="flex flex-col">
            <h4 className="text-base font-black text-gray-800 tracking-tight leading-none">{employee.full_name}</h4>
            <div className="flex items-center gap-2 mt-1.5 min-w-0">
              <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase tracking-widest truncate">{employee.employee_id}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest truncate">{employee.department}</span>
            </div>
            <p className="text-[11px] text-gray-400 font-medium truncate mt-1 opacity-70 group-hover:opacity-100 transition-opacity">{employee.email}</p>
          </div>

          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50/50 rounded-lg border border-gray-100">
            <div className="flex flex-col items-center">
              <span className="text-[8px] font-black text-green-600 uppercase tracking-[0.2em] opacity-60">Present</span>
              <span className="text-base font-black text-green-700 leading-none">{summary.Present}</span>
            </div>
            <div className="flex flex-col items-center border-l border-gray-100">
              <span className="text-[8px] font-black text-red-600 uppercase tracking-[0.2em] opacity-60">Absent</span>
              <span className="text-base font-black text-red-700 leading-none">{summary.Absent}</span>
            </div>
          </div>

          <div className="flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="primary" 
              className={`flex-grow py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${status === 'Present' ? 'bg-green-600 text-white shadow-inner scale-95 opacity-90' : isMarked ? 'bg-gray-100 text-gray-200 cursor-not-allowed border-gray-100' : 'bg-green-600 hover:bg-green-700 shadow-sm'}`}
              onClick={(e) => { 
                e.stopPropagation(); 
                onMarkAttendance(employee.id, 'Present'); 
              }}
              disabled={isActionLoading || isMarked}
            >
              {status === 'Present' ? '✔' : 'Present'}
            </Button>
            <Button 
              variant="danger" 
              className={`flex-grow py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${status === 'Absent' ? 'bg-red-600 text-white shadow-inner scale-95 opacity-90' : isMarked ? 'bg-gray-100 text-gray-200 cursor-not-allowed border-gray-100' : 'bg-red-600 hover:bg-red-700 shadow-sm'}`}
              onClick={(e) => { 
                e.stopPropagation(); 
                onMarkAttendance(employee.id, 'Absent'); 
              }}
              disabled={isActionLoading || isMarked}
            >
              {status === 'Absent' ? '✖' : 'Absent'}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeCard;
