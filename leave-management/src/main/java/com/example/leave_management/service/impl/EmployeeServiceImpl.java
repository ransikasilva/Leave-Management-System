package com.example.leave_management.service.impl;

import com.example.leave_management.model.Employee;
import com.example.leave_management.repository.EmployeeRepository;
import com.example.leave_management.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;

    @Autowired
    public EmployeeServiceImpl(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public List<Employee> findAllEmployees() {
        return employeeRepository.findAll();
    }

    @Override
    public Optional<Employee> findEmployeeById(String id) {
        return employeeRepository.findById(id);
    }

    @Override
    public Optional<Employee> findEmployeeByUserId(String userId) {
        return employeeRepository.findByUserId(userId);
    }

    @Override
    public Optional<Employee> findEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email);
    }

    @Override
    public Optional<Employee> findEmployeeByEmployeeId(String employeeId) {
        return employeeRepository.findByEmployeeId(employeeId);
    }

    @Override
    public List<Employee> findEmployeesByDepartment(String departmentId) {
        return employeeRepository.findByDepartmentId(departmentId);
    }

    @Override
    public List<Employee> findEmployeesByManager(String managerId) {
        return employeeRepository.findByManagerId(managerId);
    }

    @Override
    public List<Employee> findActiveEmployees() {
        return employeeRepository.findByActive(true);
    }

    @Override
    public List<Employee> findInactiveEmployees() {
        return employeeRepository.findByActive(false);
    }

    @Override
    public long countEmployeesByDepartment(String departmentId) {
        return employeeRepository.countByDepartmentId(departmentId);
    }

    @Override
    public long countEmployeesByManager(String managerId) {
        return employeeRepository.countByManagerId(managerId);
    }

    @Override
    public Employee saveEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public Employee updateEmployee(Employee employee) {
        return employeeRepository.save(employee);
    }

    @Override
    public void deleteEmployee(String id) {
        employeeRepository.deleteById(id);
    }

    @Override
    public Employee activateEmployee(String id) {
        Optional<Employee> employeeOpt = employeeRepository.findById(id);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setActive(true);
            return employeeRepository.save(employee);
        }
        return null;
    }

    @Override
    public Employee deactivateEmployee(String id) {
        Optional<Employee> employeeOpt = employeeRepository.findById(id);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setActive(false);
            employee.setTerminationDate(LocalDate.now());
            return employeeRepository.save(employee);
        }
        return null;
    }

    @Override
    public Employee assignManager(String employeeId, String managerId) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setManagerId(managerId);
            return employeeRepository.save(employee);
        }
        return null;
    }

    @Override
    public Employee changeDepartment(String employeeId, String departmentId) {
        Optional<Employee> employeeOpt = employeeRepository.findById(employeeId);
        if (employeeOpt.isPresent()) {
            Employee employee = employeeOpt.get();
            employee.setDepartmentId(departmentId);
            return employeeRepository.save(employee);
        }
        return null;
    }

    @Override
    public List<Employee> findTeamMembers(String managerId) {
        return employeeRepository.findByManagerId(managerId);
    }
}