package com.example.leave_management.controller;

import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.model.Employee;
import com.example.leave_management.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    private final EmployeeService employeeService;

    @Autowired
    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<Employee>> getAllEmployees() {
        List<Employee> employees = employeeService.findAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<Employee>> getActiveEmployees() {
        List<Employee> employees = employeeService.findActiveEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/inactive")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<Employee>> getInactiveEmployees() {
        List<Employee> employees = employeeService.findInactiveEmployees();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @authenticationFacade.getEmployeeId() == #id")
    public ResponseEntity<Employee> getEmployeeById(@PathVariable String id) {
        return employeeService.findEmployeeById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @authenticationFacade.getUserId() == #userId")
    public ResponseEntity<Employee> getEmployeeByUserId(@PathVariable String userId) {
        return employeeService.findEmployeeByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/department/{departmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<Employee>> getEmployeesByDepartment(@PathVariable String departmentId) {
        List<Employee> employees = employeeService.findEmployeesByDepartment(departmentId);
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @authenticationFacade.getEmployeeId() == #managerId")
    public ResponseEntity<List<Employee>> getEmployeesByManager(@PathVariable String managerId) {
        List<Employee> employees = employeeService.findEmployeesByManager(managerId);
        return ResponseEntity.ok(employees);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        Employee savedEmployee = employeeService.saveEmployee(employee);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEmployee);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Employee> updateEmployee(@PathVariable String id, @RequestBody Employee employee) {
        return employeeService.findEmployeeById(id)
                .map(existingEmployee -> {
                    employee.setId(id);
                    Employee updatedEmployee = employeeService.updateEmployee(employee);
                    return ResponseEntity.ok(updatedEmployee);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteEmployee(@PathVariable String id) {
        return employeeService.findEmployeeById(id)
                .map(employee -> {
                    employeeService.deleteEmployee(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Employee deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Employee> activateEmployee(@PathVariable String id) {
        Employee employee = employeeService.activateEmployee(id);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Employee> deactivateEmployee(@PathVariable String id) {
        Employee employee = employeeService.deactivateEmployee(id);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/{id}/manager/{managerId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Employee> assignManager(@PathVariable String id, @PathVariable String managerId) {
        Employee employee = employeeService.assignManager(id, managerId);
        return ResponseEntity.ok(employee);
    }

    @PutMapping("/{id}/department/{departmentId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Employee> changeDepartment(@PathVariable String id, @PathVariable String departmentId) {
        Employee employee = employeeService.changeDepartment(id, departmentId);
        return ResponseEntity.ok(employee);
    }
}