import React from 'react';
import Table from '@/components/ui/Table';
import { Attendance } from '@/types';

interface AttendanceTableProps {
  attendanceLogs: Attendance[];
  loading?: boolean;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendanceLogs, loading }) => {
  const getStatusColor = (status: Attendance['status']) => {
    switch (status) {
      case 'PRESENT': return 'bg-green-100 text-green-700 font-bold';
      case 'ABSENT': return 'bg-red-100 text-red-700 font-bold';
      default: return 'bg-gray-100 text-gray-700 font-bold';
    }
  };

  const columns = [
    { header: 'Date', accessor: (log: Attendance) => new Date(log.attendance_date).toLocaleDateString() },
    { 
      header: 'Status', 
      accessor: (log: Attendance) => (
        <span className={`px-4 py-1.5 rounded-full text-xs leading-tight uppercase transition-all duration-300 border border-transparent shadow-sm ${getStatusColor(log.status)}`}>
          {log.status}
        </span>
      )
    },
  ];

  return (
    <Table 
      data={attendanceLogs} 
      columns={columns} 
      loading={loading}
      emptyMessage="No attendance logs found for this employee."
    />
  );
};

export default AttendanceTable;
