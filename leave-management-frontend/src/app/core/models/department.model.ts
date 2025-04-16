export interface Department {
  id?: string;
  name: string;
  description?: string;
  departmentCode?: string;
  headOfDepartmentId?: string;
  employeeIds?: string[];
  parentDepartmentId?: string;
  childDepartmentIds?: string[];
  location?: string;
  active?: boolean;
}
