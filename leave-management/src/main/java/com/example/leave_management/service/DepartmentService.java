package com.example.leave_management.service;

import com.example.leave_management.model.Department;
import java.util.List;
import java.util.Optional;

public interface DepartmentService {
    List<Department> findAllDepartments();

    Optional<Department> findDepartmentById(String id);

    Optional<Department> findDepartmentByName(String name);

    Optional<Department> findDepartmentByCode(String departmentCode);

    List<Department> findDepartmentsByHeadOfDepartment(String headOfDepartmentId);

    List<Department> findChildDepartments(String parentDepartmentId);

    List<Department> findActiveDepartments();

    List<Department> findInactiveDepartments();

    Department saveDepartment(Department department);

    Department updateDepartment(Department department);

    void deleteDepartment(String id);

    Department activateDepartment(String id);

    Department deactivateDepartment(String id);

    Department assignDepartmentHead(String departmentId, String employeeId);

    Department setParentDepartment(String departmentId, String parentDepartmentId);

    List<Department> getDepartmentHierarchy();

    void addEmployeeToDepartment(String departmentId, String employeeId);

    void removeEmployeeFromDepartment(String departmentId, String employeeId);
}