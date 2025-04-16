package com.example.leave_management.repository;

import com.example.leave_management.model.Employee;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends MongoRepository<Employee, String> {
    List<Employee> findByDepartmentId(String departmentId);

    List<Employee> findByManagerId(String managerId);

    Optional<Employee> findByUserId(String userId);

    Optional<Employee> findByEmail(String email);

    Optional<Employee> findByEmployeeId(String employeeId);

    List<Employee> findByActive(boolean active);

    long countByDepartmentId(String departmentId);

    long countByManagerId(String managerId);
}