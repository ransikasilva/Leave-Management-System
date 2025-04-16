package com.example.leave_management.controller;

import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.model.Department;
import com.example.leave_management.service.DepartmentService;
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
@RequestMapping("/api/departments")
public class DepartmentController {
    private final DepartmentService departmentService;

    @Autowired
    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        List<Department> departments = departmentService.findAllDepartments();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/active")
    public ResponseEntity<List<Department>> getActiveDepartments() {
        List<Department> departments = departmentService.findActiveDepartments();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/inactive")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<List<Department>> getInactiveDepartments() {
        List<Department> departments = departmentService.findInactiveDepartments();
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Department> getDepartmentById(@PathVariable String id) {
        return departmentService.findDepartmentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<Department> getDepartmentByCode(@PathVariable String code) {
        return departmentService.findDepartmentByCode(code)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/head/{headId}")
    public ResponseEntity<List<Department>> getDepartmentsByHead(@PathVariable String headId) {
        List<Department> departments = departmentService.findDepartmentsByHeadOfDepartment(headId);
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/parent/{parentId}")
    public ResponseEntity<List<Department>> getChildDepartments(@PathVariable String parentId) {
        List<Department> departments = departmentService.findChildDepartments(parentId);
        return ResponseEntity.ok(departments);
    }

    @GetMapping("/hierarchy")
    public ResponseEntity<List<Department>> getDepartmentHierarchy() {
        List<Department> hierarchy = departmentService.getDepartmentHierarchy();
        return ResponseEntity.ok(hierarchy);
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Department> createDepartment(@RequestBody Department department) {
        Department savedDepartment = departmentService.saveDepartment(department);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedDepartment);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Department> updateDepartment(@PathVariable String id, @RequestBody Department department) {
        return departmentService.findDepartmentById(id)
                .map(existingDepartment -> {
                    department.setId(id);
                    Department updatedDepartment = departmentService.updateDepartment(department);
                    return ResponseEntity.ok(updatedDepartment);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<ApiResponse> deleteDepartment(@PathVariable String id) {
        return departmentService.findDepartmentById(id)
                .map(department -> {
                    departmentService.deleteDepartment(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Department deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Department> activateDepartment(@PathVariable String id) {
        Department department = departmentService.activateDepartment(id);
        return ResponseEntity.ok(department);
    }

    @PutMapping("/{id}/deactivate")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Department> deactivateDepartment(@PathVariable String id) {
        Department department = departmentService.deactivateDepartment(id);
        return ResponseEntity.ok(department);
    }

    @PutMapping("/{id}/head/{employeeId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Department> assignDepartmentHead(@PathVariable String id, @PathVariable String employeeId) {
        Department department = departmentService.assignDepartmentHead(id, employeeId);
        return ResponseEntity.ok(department);
    }

    @PutMapping("/{id}/parent/{parentId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<Department> setParentDepartment(@PathVariable String id, @PathVariable String parentId) {
        Department department = departmentService.setParentDepartment(id, parentId);
        return ResponseEntity.ok(department);
    }

    @PutMapping("/{id}/employee/{employeeId}/add")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ApiResponse> addEmployeeToDepartment(@PathVariable String id, @PathVariable String employeeId) {
        departmentService.addEmployeeToDepartment(id, employeeId);
        return ResponseEntity.ok(new ApiResponse(true, "Employee added to department successfully"));
    }

    @PutMapping("/{id}/employee/{employeeId}/remove")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_HR') or hasAuthority('ROLE_MANAGER')")
    public ResponseEntity<ApiResponse> removeEmployeeFromDepartment(@PathVariable String id, @PathVariable String employeeId) {
        departmentService.removeEmployeeFromDepartment(id, employeeId);
        return ResponseEntity.ok(new ApiResponse(true, "Employee removed from department successfully"));
    }
}