import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Employee } from '@/types';

const employeeSchema = z.object({
  employee_id: z.string()
    .min(3, 'ID must be at least 3 characters')
    .max(50, 'ID too long')
    .regex(/^[A-Z0-9-]+$/, 'ID can only contain uppercase letters, numbers, and hyphens'),
  full_name: z.string()
    .min(2, 'Name too short')
    .max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  department: z.string()
    .min(2, 'Department too short')
    .max(50, 'Department too long'),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  onSuccess?: () => void;
  onSubmit: (employee: Omit<Employee, 'id' | 'created_at'>) => Promise<void>;
}

const EmployeeForm: React.FC<EmployeeFormProps> = ({ onSuccess, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
  });

  const onFormSubmit = async (data: EmployeeFormData) => {
    setServerError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await onSubmit(data);
      reset();
      setSuccess('Employee added successfully!');
      if (onSuccess) onSuccess();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setServerError(err.message || 'Failed to add employee. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit(onFormSubmit)}>
      {serverError && (
        <div className="bg-red-50 border border-red-100 p-4 rounded-lg text-red-600 text-sm font-medium">
          {serverError}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-100 p-4 rounded-lg text-green-600 text-sm font-medium">
          {success}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input 
          {...register('full_name')} 
          label="Full Name" 
          placeholder="e.g. John Doe" 
          error={errors.full_name?.message}
        />
        <Input 
          {...register('employee_id')} 
          label="Employee ID" 
          placeholder="e.g. EMP001" 
          error={errors.employee_id?.message}
        />
        <Input 
          {...register('email')} 
          label="Email Address" 
          type="email" 
          placeholder="e.g. john@example.com" 
          error={errors.email?.message}
        />
        <Input
          {...register('department')}
          label="Department"
          placeholder="e.g. Engineering"
          error={errors.department?.message}
          list="department-list"
        />
        <datalist id="department-list">
          <option value="Engineering" />
          <option value="Human Resources" />
          <option value="Sales" />
          <option value="Marketing" />
          <option value="Customer Support" />
          <option value="Product Management" />
        </datalist>
      </div>
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          className="w-full md:w-auto px-12 py-3"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Employee'}
        </Button>
      </div>
    </form>
  );
};

export default EmployeeForm;
