'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import AttendanceHistory from './AttendanceHistory';
import EmployeeCard from './EmployeeCard';
import DirectoryActions from './DirectoryActions';
import { Employee, AttendanceStatus, Attendance } from '@/types';
import { api } from '@/services/api';

/**
 * EmployeeTable acts as a controller for the employee list,
 * coordinating attendance marking, history viewing, and deletions.
 */
interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (id: string) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ 
  employees, 
  loading, 
  onRefresh, 
  onDelete, 
  onBulkDelete 
}) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState<Record<string, AttendanceStatus>>({});
  const [summaryData, setSummaryData] = useState<Record<string, { Present: number; Absent: number }>>({});

  const fetchAttendanceContext = useCallback(async () => {
    if (employees.length === 0) return;
    try {
      setError(null);
      const isoDate = new Date(selectedDate).toISOString();
      const [attendance, summary] = await Promise.all([
        api.getAttendanceByDate(isoDate),
        api.getAttendanceSummary()
      ]);

      const attendanceMapping: Record<string, AttendanceStatus> = {};
      attendance.forEach((record: Attendance) => {
        attendanceMapping[record.employee_id] = record.status;
      });
      setAttendanceData(attendanceMapping);
      setSummaryData(summary);
    } catch (err) {
      setError('Failed to load current attendance summaries.');
    }
  }, [selectedDate, employees.length]);

  useEffect(() => {
    fetchAttendanceContext();
  }, [fetchAttendanceContext]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(employees.map(emp => emp.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const toggleSelectMember = (id: string) => {
    const nextSelected = new Set(selectedIds);
    if (nextSelected.has(id)) {
      nextSelected.delete(id);
    } else {
      nextSelected.add(id);
    }
    setSelectedIds(nextSelected);
  };

  const executeMemberDeletion = async () => {
    if (onDelete && pendingDeleteId) {
      try {
        setIsActionLoading(true);
        await onDelete(pendingDeleteId);
        setIsDeleteModalOpen(false);
        setPendingDeleteId(null);
        await fetchAttendanceContext();
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const executeBulkDeletion = async () => {
    if (onBulkDelete && selectedIds.size > 0) {
      try {
        setIsActionLoading(true);
        await onBulkDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsBulkDeleteModalOpen(false);
        await fetchAttendanceContext();
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const markAttendance = async (id: string, status: AttendanceStatus) => {
    try {
      setIsActionLoading(true);
      const isoDate = new Date(selectedDate).toISOString();
      await api.markAttendance({
        employee_id: id,
        attendance_date: isoDate,
        status: status
      });
      
      await fetchAttendanceContext();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'An unexpected error occurred while marking attendance.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const markBulkAttendance = async (status: AttendanceStatus) => {
    if (selectedIds.size === 0) return;
    try {
      setIsActionLoading(true);
      const isoDate = new Date(selectedDate).toISOString();
      await api.bulkMarkAttendance({
        employee_ids: Array.from(selectedIds),
        attendance_date: isoDate,
        status: status
      });
      
      setSelectedIds(new Set());
      await fetchAttendanceContext();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update group attendance.');
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <DirectoryActions 
        selectedCount={selectedIds.size}
        totalCount={employees.length}
        selectedDate={selectedDate}
        isActionLoading={isActionLoading}
        onSelectAll={toggleSelectAll}
        onDateChange={setSelectedDate}
        onBulkMark={markBulkAttendance}
        onBulkDelete={() => setIsBulkDeleteModalOpen(true)}
      />

      {error ? (
        <Card className="p-12 text-center space-y-4 border-red-100 bg-red-50/30">
          <p className="text-red-500 font-medium italic">{error}</p>
          <button 
            onClick={() => fetchAttendanceContext()}
            className="text-xs font-black uppercase tracking-widest text-blue-600 hover:underline"
          >
            Retry Loading
          </button>
        </Card>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-48 bg-gray-50 animate-pulse rounded-2xl border border-gray-100" />)}
        </div>
      ) : employees.length === 0 ? (
        <Card className="p-12 text-center text-gray-400 italic font-medium border-dashed">
          No records found.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employees.map((employee) => (
            <EmployeeCard 
              key={employee.id}
              employee={employee}
              status={attendanceData[employee.id]}
              summary={summaryData[employee.id] || { Present: 0, Absent: 0 }}
              isSelected={selectedIds.has(employee.id)}
              isMarked={!!attendanceData[employee.id]}
              isActionLoading={isActionLoading}
              onSelect={toggleSelectMember}
              onDelete={(id) => { 
                setPendingDeleteId(id); 
                setIsDeleteModalOpen(true); 
              }}
              onMarkAttendance={markAttendance}
              onClick={() => { 
                setSelectedEmployee(employee); 
                setIsHistoryModalOpen(true); 
              }}
            />
          ))}
        </div>
      )}

      {/* Persistence Modals */}
      <Modal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        title={selectedEmployee ? `${selectedEmployee.full_name} - History` : 'History'}
        size="lg"
      >
        {selectedEmployee && <AttendanceHistory employeeId={selectedEmployee.id} />}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={executeMemberDeletion}
        title="Confirm Deletion"
        message="Are you sure you want to remove this employee profile? This action is permanent."
        confirmText="Remove"
        variant="danger"
        loading={isActionLoading}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={executeBulkDeletion}
        title="Bulk Removal"
        message={`Are you sure you want to remove ${selectedIds.size} employee profiles? This action is permanent.`}
        confirmText="Remove All"
        variant="danger"
        loading={isActionLoading}
      />
    </div>
  );
};

export default EmployeeTable;
