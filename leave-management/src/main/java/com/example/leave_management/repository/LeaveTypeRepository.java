package com.example.leave_management.repository;

import com.example.leave_management.model.LeaveType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveTypeRepository extends MongoRepository<LeaveType, String> {
    Optional<LeaveType> findByName(String name);

    List<LeaveType> findByActive(boolean active);

    List<LeaveType> findByPaidLeave(boolean paidLeave);

    List<LeaveType> findByRequiresApproval(boolean requiresApproval);
}