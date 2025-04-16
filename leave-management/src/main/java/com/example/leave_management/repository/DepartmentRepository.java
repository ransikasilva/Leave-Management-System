package com.example.leave_management.repository;

import com.example.leave_management.model.Department;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends MongoRepository<Department, String> {
    Optional<Department> findByName(String name);

    Optional<Department> findByDepartmentCode(String departmentCode);

    List<Department> findByHeadOfDepartmentId(String headOfDepartmentId);

    List<Department> findByParentDepartmentId(String parentDepartmentId);

    List<Department> findByActive(boolean active);
}