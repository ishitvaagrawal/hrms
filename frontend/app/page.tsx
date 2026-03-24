'use client';

import React, { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import DepartmentCard from '@/components/dashboard/DepartmentCard';
import EmployeeTable from '@/components/employee/EmployeeTable';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Pagination from '@/components/ui/Pagination';
import Modal from '@/components/ui/Modal';
import { Department, Employee } from '@/types';
import { api } from '@/services/api';
import { useSubscription } from '@/hooks/useSubscription';

// Lazy load form
const EmployeeForm = dynamic(() => import('@/components/employee/EmployeeForm'), {
  loading: () => <div className="h-40 bg-gray-50 animate-pulse rounded-xl" />,
});

export default function DashboardPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Pagination State for Departments (Cards)
  const [deptPage, setDeptPage] = useState(1);
  const deptPageSize = 6;

  // Pagination State for Employees (Table)
  const [empPage, setEmpPage] = useState(1);
  const [empPageSize, setEmpPageSize] = useState(10);

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getEmployees();
      setEmployees(data);
      
      const counts: Record<string, number> = {};
      data.forEach(emp => {
        counts[emp.department] = (counts[emp.department] || 0) + 1;
      });

      const deptData: Department[] = Object.entries(counts).map(([name, count], index) => ({
        id: String(index + 1),
        name,
        employeeCount: count
      }));

      deptData.sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(deptData);
    } catch (err) {
      console.error(err);
      setError('Could not load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useSubscription((data) => {
    if (data.event === 'EMPLOYEES_UPDATED') {
      loadDashboard();
    }
  });

  const handleCreateEmployee = async (employeeData: Omit<Employee, 'id' | 'created_at'>) => {
    try {
      await api.createEmployee(employeeData);
      setIsAddModalOpen(false);
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : 'Failed to create employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      await api.deleteEmployee(id);
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert('Failed to delete employee.');
    }
  };

  const handleBulkDelete = async (ids: string[]) => {
    try {
      setLoading(true);
      await api.bulkDeleteEmployees(ids);
      await loadDashboard();
    } catch (err) {
      console.error(err);
      alert('Some employees could not be deleted.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination Calculations: Departments
  const filteredDepartments = departments; // Can add search here later
  const totalDeptItems = filteredDepartments.length;
  const totalDeptPages = Math.ceil(totalDeptItems / deptPageSize) || 1;
  const deptStartIndex = (deptPage - 1) * deptPageSize;
  const paginatedDepts = filteredDepartments.slice(deptStartIndex, deptStartIndex + deptPageSize);

  // Pagination Calculations: Employees
  const filteredEmployees = selectedDept 
    ? employees.filter(emp => emp.department === selectedDept)
    : employees;
  
  const totalEmpItems = filteredEmployees.length;
  const totalEmpPages = Math.ceil(totalEmpItems / empPageSize) || 1;
  const empStartIndex = (empPage - 1) * empPageSize;
  const paginatedEmployees = filteredEmployees.slice(empStartIndex, empStartIndex + empPageSize);

  return (
    <div className="space-y-12 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Welcome, <span className="text-blue-600">Admin</span></h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Enterprise Hub Management</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 font-black tracking-widest uppercase px-8 shadow-lg shadow-blue-100"
        >
          Add Employee
        </Button>
      </div>

      <Modal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        title="Register New Employee"
        size="lg"
      >
        <EmployeeForm onSubmit={handleCreateEmployee} />
      </Modal>

      {error && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 font-medium">
          {error}
        </div>
      )}

      {/* Departments Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-gray-800 tracking-tight uppercase">
            {selectedDept ? `Department: ${selectedDept}` : 'Current Departments'}
          </h2>
          {selectedDept && (
            <button 
              onClick={() => { setSelectedDept(null); setEmpPage(1); }}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 uppercase tracking-widest"
            >
              Show All Employees
            </button>
          )}
        </div>

        {departments.length === 0 ? (
          <Card className="p-12 text-center text-gray-500">
            No departments found. Add an employee to get started.
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedDepts.map((dept) => (
                <DepartmentCard 
                  key={dept.id} 
                  department={dept} 
                  onClick={() => {
                    setSelectedDept(dept.name === selectedDept ? null : dept.name);
                    setEmpPage(1);
                  }}
                  active={selectedDept === dept.name}
                />
              ))}
            </div>
            {totalDeptPages > 1 && (
              <div className="flex justify-center pt-4">
                <Pagination
                  currentPage={deptPage}
                  totalPages={totalDeptPages}
                  onPageChange={setDeptPage}
                  pageSize={deptPageSize}
                  hidePageSizeToggle
                />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Employee Directory Section */}
      <section className="space-y-6">
        <Card title={selectedDept ? `Directory: ${selectedDept}` : "Global Employee Directory"}>
          <div className="space-y-6">
            <EmployeeTable 
              employees={paginatedEmployees} 
              loading={loading}
              onRefresh={loadDashboard}
              onDelete={handleDeleteEmployee}
              onBulkDelete={handleBulkDelete}
            />
            
            <Pagination
              currentPage={empPage}
              totalPages={totalEmpPages}
              onPageChange={setEmpPage}
              pageSize={empPageSize}
              onPageSizeChange={(size) => { setEmpPageSize(size); setEmpPage(1); }}
              totalItems={totalEmpItems}
            />
          </div>
        </Card>
      </section>
    </div>
  );
}
