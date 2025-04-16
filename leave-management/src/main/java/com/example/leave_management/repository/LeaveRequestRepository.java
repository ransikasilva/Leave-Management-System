package com.example.leave_management.repository;

import com.example.leave_management.model.LeaveRequest;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends MongoRepository<LeaveRequest, String> {
    List<LeaveRequest> findByEmployeeId(String employeeId);

    List<LeaveRequest> findByEmployeeIdAndStatus(String employeeId, String status);

    List<LeaveRequest> findByApproverId(String approverId);

    List<LeaveRequest> findByApproverIdAndStatus(String approverId, String status);

    List<LeaveRequest> findByStatus(String status);

    List<LeaveRequest> findByLeaveTypeId(String leaveTypeId);

    List<LeaveRequest> findByStartDateBetween(LocalDate start, LocalDate end);

    List<LeaveRequest> findByEndDateBetween(LocalDate start, LocalDate end);

    List<LeaveRequest> findByStartDateBeforeAndEndDateAfter(LocalDate endDate, LocalDate startDate);

    List<LeaveRequest> findByEmployeeIdAndStartDateBetween(String employeeId, LocalDate start, LocalDate end);

    List<LeaveRequest> findByDepartmentIdAndStatus(String departmentId, String status);
}