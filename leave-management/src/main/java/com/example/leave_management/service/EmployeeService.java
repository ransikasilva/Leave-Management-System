package com.example.leave_management.service;

import com.example.leave_management.model.Employee;
import java.util.List;
import java.util.Optional;

public interface EmployeeService {
    List<Employee> findAllEmployees();

    Optional<Employee> findEmployeeById(String id);

    Optional<Employee> findEmployeeByUserId(String userId);

    Optional<Employee> findEmployeeByEmail(String email);

    Optional<Employee> findEmployeeByEmployeeId(String employeeId);

    List<Employee> findEmployeesByDepartment(String departmentId);

    List<Employee> findEmployeesByManager(String managerId);

    List<Employee> findActiveEmployees();

    List<Employee> findInactiveEmployees();

    long countEmployeesByDepartment(String departmentId);

    long countEmployeesByManager(String managerId);

    Employee saveEmployee(Employee employee);

    Employee updateEmployee(Employee employee);

    void deleteEmployee(String id);

    Employee activateEmployee(String id);

    Employee deactivateEmployee(String id);

    Employee assignManager(String employeeId, String managerId);

    Employee changeDepartment(String employeeId, String departmentId);

    List<Employee> findTeamMembers(String managerId);
}