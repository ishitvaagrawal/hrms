import React from 'react';
import Card from '@/components/ui/Card';
import { Department, Severity } from '@/types';

interface DepartmentCardProps {
  department: Department;
  onClick?: () => void;
  active?: boolean;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onClick, active }) => {
  const getSeverity = (count: number): Severity => {
    if (count === 0) return 'critical';
    if (count < 5) return 'warning';
    return 'healthy';
  };

  const severity = getSeverity(department.employeeCount);

  const colors = {
    critical: 'text-red-600 bg-red-100 border-red-200',
    warning: 'text-yellow-600 bg-yellow-100 border-yellow-200',
    healthy: 'text-green-600 bg-green-100 border-green-200',
  };

  return (
    <div onClick={onClick} className="cursor-pointer h-full">
      <Card className={`h-full flex flex-col hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 ${active ? 'ring-2 ring-blue-600 shadow-xl border-blue-100 bg-blue-50/10' : ''}`}>
        <div className="flex justify-between items-start mb-2">
          <h4 className="text-lg font-bold text-gray-800 leading-tight">{department.name}</h4>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-50">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Employees</span>
          <div className={`px-3 py-1 rounded-full text-base font-black border transition-colors duration-300 ${colors[severity]}`}>
            {department.employeeCount}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DepartmentCard;
