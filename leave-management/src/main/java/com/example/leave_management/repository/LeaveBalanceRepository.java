package com.example.leave_management.repository;

import com.example.leave_management.model.LeaveBalance;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface LeaveBalanceRepository extends MongoRepository<LeaveBalance, String> {
    List<LeaveBalance> findByEmployeeId(String employeeId);

    List<LeaveBalance> findByEmployeeIdAndYear(String employeeId, int year);

    Optional<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(String employeeId, String leaveTypeId, int year);

    List<LeaveBalance> findByLeaveTypeId(String leaveTypeId);

    List<LeaveBalance> findByYear(int year);
}