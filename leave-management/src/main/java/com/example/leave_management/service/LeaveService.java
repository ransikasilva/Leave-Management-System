package com.example.leave_management.service;

import com.example.leave_management.model.LeaveRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface LeaveService {
    List<LeaveRequest> findAllLeaveRequests();

    Optional<LeaveRequest> findLeaveRequestById(String id);

    List<LeaveRequest> findLeaveRequestsByEmployee(String employeeId);

    List<LeaveRequest> findLeaveRequestsByEmployeeAndStatus(String employeeId, String status);

    List<LeaveRequest> findLeaveRequestsByApprover(String approverId);

    List<LeaveRequest> findLeaveRequestsByApproverAndStatus(String approverId, String status);

    List<LeaveRequest> findLeaveRequestsByStatus(String status);

    List<LeaveRequest> findLeaveRequestsByLeaveType(String leaveTypeId);

    List<LeaveRequest> findLeaveRequestsInDateRange(LocalDate startDate, LocalDate endDate);

    List<LeaveRequest> findOverlappingLeaveRequests(LocalDate startDate, LocalDate endDate);

    List<LeaveRequest> findEmployeeLeaveRequestsInDateRange(String employeeId, LocalDate startDate, LocalDate endDate);

    List<LeaveRequest> findPendingLeaveRequestsByDepartment(String departmentId);

    LeaveRequest submitLeaveRequest(LeaveRequest leaveRequest);

    LeaveRequest approveLeaveRequest(String leaveRequestId, String approverId, String comments);

    LeaveRequest rejectLeaveRequest(String leaveRequestId, String approverId, String comments);

    LeaveRequest cancelLeaveRequest(String leaveRequestId, String cancellationReason);

    LeaveRequest updateLeaveRequest(LeaveRequest leaveRequest);

    void deleteLeaveRequest(String id);

    double calculateLeaveDuration(LocalDate startDate, LocalDate endDate, boolean halfDay, String halfDayType);

    boolean isLeaveOverlapping(String employeeId, LocalDate startDate, LocalDate endDate, String currentLeaveRequestId);

    boolean isEmployeeEligibleForLeave(String employeeId, String leaveTypeId, double duration);
}