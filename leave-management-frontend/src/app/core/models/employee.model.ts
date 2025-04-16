export interface Employee {
  id?: string;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  departmentId?: string;
  designation?: string;
  managerId?: string;
  joiningDate?: Date;
  probationEndDate?: Date;
  employmentType?: string;
  employeeId?: string;
  address?: string;
  active?: boolean;
}
