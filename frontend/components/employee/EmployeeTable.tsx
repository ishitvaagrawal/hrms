'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Modal from '@/components/ui/Modal';
import AttendanceHistory from './AttendanceHistory';
import { Employee, AttendanceStatus, Attendance } from '@/types';
import { api } from '@/services/api';

interface EmployeeTableProps {
  employees: Employee[];
  loading?: boolean;
  onRefresh?: () => void;
  onDelete?: (id: string) => Promise<void>;
  onBulkDelete?: (ids: string[]) => Promise<void>;
}

const EmployeeTable: React.FC<EmployeeTableProps> = ({ employees, loading, onRefresh, onDelete, onBulkDelete }) => {
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

  const fetchData = useCallback(async () => {
    if (employees.length === 0) return;
    try {
      const date = new Date(selectedDate).toISOString();
      const [attendance, summary] = await Promise.all([
        api.getAttendanceByDate(date),
        api.getAttendanceSummary()
      ]);

      const mapping: Record<string, AttendanceStatus> = {};
      attendance.forEach((record: Attendance) => {
        mapping[record.employee_id] = record.status;
      });
      setAttendanceData(mapping);
      setSummaryData(summary);
    } catch (err) {
      console.error('Failed to fetch attendance data:', err);
      setError('Failed to load attendance summaries.');
    }
  }, [selectedDate, employees.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(employees.map(emp => emp.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleConfirmDelete = async () => {
    if (onDelete && pendingDeleteId) {
      try {
        setIsActionLoading(true);
        await onDelete(pendingDeleteId);
        setIsDeleteModalOpen(false);
        setPendingDeleteId(null);
        await fetchData();
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleConfirmBulkDelete = async () => {
    if (onBulkDelete && selectedIds.size > 0) {
      try {
        setIsActionLoading(true);
        await onBulkDelete(Array.from(selectedIds));
        setSelectedIds(new Set());
        setIsBulkDeleteModalOpen(false);
        await fetchData();
      } finally {
        setIsActionLoading(false);
      }
    }
  };

  const handleMarkAttendance = async (id: string, status: AttendanceStatus) => {
    try {
      setIsActionLoading(true);
      const date = new Date(selectedDate).toISOString();
      await api.markAttendance({
        employee_id: id,
        attendance_date: date,
        status: status
      });
      
      await fetchData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to mark attendance:', error);
      alert(error instanceof Error ? error.message : 'Failed to mark attendance');
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleBulkMarkAttendance = async (status: AttendanceStatus) => {
    if (selectedIds.size === 0) return;
    try {
      setIsActionLoading(true);
      const date = new Date(selectedDate).toISOString();
      const ids = Array.from(selectedIds);
      await api.bulkMarkAttendance({
        employee_ids: ids,
        attendance_date: date,
        status: status
      });
      
      setSelectedIds(new Set());
      await fetchData();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Failed to mark bulk attendance:', error);
      alert(error instanceof Error ? error.message : 'Failed to mark group attendance');
    } finally {
      setIsActionLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Filters & Actions Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm sticky top-20 z-10">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
             <input 
              type="checkbox" 
              onChange={(e) => handleSelectAll(e.target.checked)} 
              checked={employees.length > 0 && selectedIds.size === employees.length}
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
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-36 text-sm font-bold border-none bg-transparent focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-300">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mr-2">{selectedIds.size} Selected</span>
            <Button 
              variant="primary" 
              className="bg-green-600 hover:bg-green-700 px-4 py-1.5 text-xs font-black tracking-widest uppercase"
              onClick={() => handleBulkMarkAttendance('Present')}
              loading={isActionLoading}
            >
              Mark Present
            </Button>
            <Button 
              variant="danger" 
              className="bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-black tracking-widest uppercase"
              onClick={() => handleBulkMarkAttendance('Absent')}
              loading={isActionLoading}
            >
              Mark Absent
            </Button>
            <Button 
              variant="ghost" 
              className="text-red-600 hover:bg-red-50 px-4 py-1.5 text-xs font-black tracking-widest uppercase border border-transparent hover:border-red-100"
              onClick={() => setIsBulkDeleteModalOpen(true)}
              loading={isActionLoading}
            >
              Delete
            </Button>
          </div>
        )}
      </div>

      {error ? (
        <Card className="p-12 text-center space-y-4 border-red-100 bg-red-50/30">
          <p className="text-red-500 font-medium italic">{error}</p>
          <button 
            onClick={() => fetchData()}
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
        <Card className="p-12 text-center text-gray-500 italic font-medium border-dashed">
          No employees found. Add your first employee to get started!
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {employees.map((employee) => {
            const status = attendanceData[employee.id];
            const summary = summaryData[employee.id] || { Present: 0, Absent: 0 };
            const isMarked = !!status;

            return (
              <Card 
                key={employee.id} 
                className={`relative group border-2 transition-all duration-300 cursor-pointer ${selectedIds.has(employee.id) ? 'border-blue-500 bg-blue-50/5 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                onClick={() => { setSelectedEmployee(employee); setIsHistoryModalOpen(true); }}
              >
                <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <Button 
                    variant="ghost" 
                    className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl"
                    onClick={(e) => { e.stopPropagation(); setPendingDeleteId(employee.id); setIsDeleteModalOpen(true); }}
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
                      checked={selectedIds.has(employee.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleSelectRow(employee.id)}
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

                    {/* Attendance Summary Grid */}
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
                        onClick={(e) => { e.stopPropagation(); handleMarkAttendance(employee.id, 'Present'); }}
                        disabled={isActionLoading || isMarked}
                      >
                        {status === 'Present' ? '✔' : 'Present'}
                      </Button>
                      <Button 
                        variant="danger" 
                        className={`flex-grow py-1.5 text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${status === 'Absent' ? 'bg-red-600 text-white shadow-inner scale-95 opacity-90' : isMarked ? 'bg-gray-100 text-gray-200 cursor-not-allowed border-gray-100' : 'bg-red-600 hover:bg-red-700 shadow-sm'}`}
                        onClick={(e) => { e.stopPropagation(); handleMarkAttendance(employee.id, 'Absent'); }}
                        disabled={isActionLoading || isMarked}
                      >
                        {status === 'Absent' ? '✖' : 'Absent'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Persistence Modal for Attendance History */}
      <Modal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        title={selectedEmployee ? `${selectedEmployee.full_name} - Attendance History` : 'Attendance History'}
        size="lg"
      >
        {selectedEmployee && <AttendanceHistory employeeId={selectedEmployee.id} />}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Employee"
        message="Are you sure you want to delete this employee? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
        loading={isActionLoading}
      />

      <ConfirmDialog
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title="Bulk Delete"
        message={`Are you sure you want to delete ${selectedIds.size} employees? This action cannot be undone.`}
        confirmText="Delete All"
        variant="danger"
        loading={isActionLoading}
      />
    </div>
  );
};

export default EmployeeTable;
