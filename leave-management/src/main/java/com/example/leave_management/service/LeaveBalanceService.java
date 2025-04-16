package com.example.leave_management.service;

import com.example.leave_management.model.LeaveBalance;
import java.util.List;
import java.util.Optional;

public interface LeaveBalanceService {
    List<LeaveBalance> findAllLeaveBalances();

    Optional<LeaveBalance> findLeaveBalanceById(String id);

    List<LeaveBalance> findLeaveBalancesByEmployee(String employeeId);

    List<LeaveBalance> findLeaveBalancesByEmployeeAndYear(String employeeId, int year);

    Optional<LeaveBalance> findLeaveBalanceByEmployeeAndLeaveTypeAndYear(String employeeId, String leaveTypeId, int year);

    List<LeaveBalance> findLeaveBalancesByLeaveType(String leaveTypeId);

    List<LeaveBalance> findLeaveBalancesByYear(int year);

    LeaveBalance saveLeaveBalance(LeaveBalance leaveBalance);

    LeaveBalance updateLeaveBalance(LeaveBalance leaveBalance);

    void deleteLeaveBalance(String id);

    LeaveBalance allocateLeaveBalance(String employeeId, String leaveTypeId, int year, double amount);

    LeaveBalance adjustLeaveBalance(String leaveBalanceId, double amount, String reason, String approvedBy);

    LeaveBalance deductLeave(String employeeId, String leaveTypeId, int year, double amount, String leaveRequestId);

    LeaveBalance refundLeave(String employeeId, String leaveTypeId, int year, double amount, String leaveRequestId);

    LeaveBalance carryForwardLeaveBalance(String employeeId, String leaveTypeId, int fromYear, int toYear);

    double getAvailableLeaveBalance(String employeeId, String leaveTypeId, int year);

    void initializeYearlyLeaveBalances(int year);

    void initializeEmployeeLeaveBalances(String employeeId, int year);
}