"use client";

import { EmployeeForm, useCreateEmployee } from "@/features/employees";
import type { CreateEmployeeDto, UpdateEmployeeDto } from "@/entities/employee";

export default function NewEmployeePage() {
  const { mutate: createEmployee, isPending } = useCreateEmployee();

  const handleSubmit = (data: CreateEmployeeDto | UpdateEmployeeDto) => {
    createEmployee(data as CreateEmployeeDto);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Новый сотрудник</h1>
        <p className="text-[var(--color-text-secondary)]">Добавьте нового члена команды</p>
      </div>

      <EmployeeForm onSubmit={handleSubmit} isSubmitting={isPending} />
    </div>
  );
}

