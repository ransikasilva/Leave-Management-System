package com.example.leave_management.service.impl;

import com.example.leave_management.model.Department;
import com.example.leave_management.repository.DepartmentRepository;
import com.example.leave_management.service.DepartmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;

    @Autowired
    public DepartmentServiceImpl(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Override
    public List<Department> findAllDepartments() {
        return departmentRepository.findAll();
    }

    @Override
    public Optional<Department> findDepartmentById(String id) {
        return departmentRepository.findById(id);
    }

    @Override
    public Optional<Department> findDepartmentByName(String name) {
        return departmentRepository.findByName(name);
    }

    @Override
    public Optional<Department> findDepartmentByCode(String departmentCode) {
        return departmentRepository.findByDepartmentCode(departmentCode);
    }

    @Override
    public List<Department> findDepartmentsByHeadOfDepartment(String headOfDepartmentId) {
        return departmentRepository.findByHeadOfDepartmentId(headOfDepartmentId);
    }

    @Override
    public List<Department> findChildDepartments(String parentDepartmentId) {
        return departmentRepository.findByParentDepartmentId(parentDepartmentId);
    }

    @Override
    public List<Department> findActiveDepartments() {
        return departmentRepository.findByActive(true);
    }

    @Override
    public List<Department> findInactiveDepartments() {
        return departmentRepository.findByActive(false);
    }

    @Override
    public Department saveDepartment(Department department) {
        return departmentRepository.save(department);
    }

    @Override
    public Department updateDepartment(Department department) {
        return departmentRepository.save(department);
    }

    @Override
    public void deleteDepartment(String id) {
        departmentRepository.deleteById(id);
    }

    @Override
    public Department activateDepartment(String id) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (departmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            department.setActive(true);
            return departmentRepository.save(department);
        }
        return null;
    }

    @Override
    public Department deactivateDepartment(String id) {
        Optional<Department> departmentOpt = departmentRepository.findById(id);
        if (departmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            department.setActive(false);
            return departmentRepository.save(department);
        }
        return null;
    }

    @Override
    public Department assignDepartmentHead(String departmentId, String employeeId) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        if (departmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            department.setHeadOfDepartmentId(employeeId);
            return departmentRepository.save(department);
        }
        return null;
    }

    @Override
    public Department setParentDepartment(String departmentId, String parentDepartmentId) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        Optional<Department> parentDepartmentOpt = departmentRepository.findById(parentDepartmentId);

        if (departmentOpt.isPresent() && parentDepartmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            Department parentDepartment = parentDepartmentOpt.get();

            department.setParentDepartmentId(parentDepartmentId);

            if (!parentDepartment.getChildDepartmentIds().contains(departmentId)) {
                parentDepartment.getChildDepartmentIds().add(departmentId);
                departmentRepository.save(parentDepartment);
            }

            return departmentRepository.save(department);
        }
        return null;
    }

    @Override
    public List<Department> getDepartmentHierarchy() {
        List<Department> allDepartments = departmentRepository.findAll();
        return allDepartments.stream()
                .filter(dept -> dept.getParentDepartmentId() == null)
                .collect(Collectors.toList());
    }

    @Override
    public void addEmployeeToDepartment(String departmentId, String employeeId) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        if (departmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            if (!department.getEmployeeIds().contains(employeeId)) {
                department.getEmployeeIds().add(employeeId);
                departmentRepository.save(department);
            }
        }
    }

    @Override
    public void removeEmployeeFromDepartment(String departmentId, String employeeId) {
        Optional<Department> departmentOpt = departmentRepository.findById(departmentId);
        if (departmentOpt.isPresent()) {
            Department department = departmentOpt.get();
            department.getEmployeeIds().remove(employeeId);
            departmentRepository.save(department);
        }
    }
}