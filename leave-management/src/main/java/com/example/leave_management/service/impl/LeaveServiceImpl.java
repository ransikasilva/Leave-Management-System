package com.example.leave_management.service.impl;

import com.example.leave_management.model.LeaveRequest;
import com.example.leave_management.model.Holiday;
import com.example.leave_management.repository.LeaveRequestRepository;
import com.example.leave_management.repository.HolidayRepository;
import com.example.leave_management.service.LeaveBalanceService;
import com.example.leave_management.service.LeaveService;
import com.example.leave_management.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeaveServiceImpl implements LeaveService {
    private final LeaveRequestRepository leaveRequestRepository;
    private final HolidayRepository holidayRepository;
    private final LeaveBalanceService leaveBalanceService;
    private final NotificationService notificationService;

    @Autowired
    public LeaveServiceImpl(LeaveRequestRepository leaveRequestRepository,
                            HolidayRepository holidayRepository,
                            LeaveBalanceService leaveBalanceService,
                            NotificationService notificationService) {
        this.leaveRequestRepository = leaveRequestRepository;
        this.holidayRepository = holidayRepository;
        this.leaveBalanceService = leaveBalanceService;
        this.notificationService = notificationService;
    }

    @Override
    public List<LeaveRequest> findAllLeaveRequests() {
        return leaveRequestRepository.findAll();
    }

    @Override
    public Optional<LeaveRequest> findLeaveRequestById(String id) {
        return leaveRequestRepository.findById(id);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsByEmployee(String employeeId) {
        return leaveRequestRepository.findByEmployeeId(employeeId);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsByEmployeeAndStatus(String employeeId, String status) {
        return leaveRequestRepository.findByEmployeeIdAndStatus(employeeId, status);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsByApprover(String approverId) {
        return leaveRequestRepository.findByApproverId(approverId);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsByApproverAndStatus(String approverId, String status) {
        return leaveRequestRepository.findByApproverIdAndStatus(approverId, status);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsByStatus(String status) {
        return leaveRequestRepository.findByStatus(status);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsByLeaveType(String leaveTypeId) {
        return leaveRequestRepository.findByLeaveTypeId(leaveTypeId);
    }

    @Override
    public List<LeaveRequest> findLeaveRequestsInDateRange(LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findByStartDateBetween(startDate, endDate);
    }

    @Override
    public List<LeaveRequest> findOverlappingLeaveRequests(LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findByStartDateBeforeAndEndDateAfter(endDate, startDate);
    }

    @Override
    public List<LeaveRequest> findEmployeeLeaveRequestsInDateRange(String employeeId, LocalDate startDate, LocalDate endDate) {
        return leaveRequestRepository.findByEmployeeIdAndStartDateBetween(employeeId, startDate, endDate);
    }

    @Override
    public List<LeaveRequest> findPendingLeaveRequestsByDepartment(String departmentId) {
        return leaveRequestRepository.findByDepartmentIdAndStatus(departmentId, "PENDING");
    }

    @Override
    public LeaveRequest submitLeaveRequest(LeaveRequest leaveRequest) {
        double duration = calculateLeaveDuration(
                leaveRequest.getStartDate(),
                leaveRequest.getEndDate(),
                leaveRequest.isHalfDay(),
                leaveRequest.getHalfDayType()
        );

        leaveRequest.setDuration(duration);
        leaveRequest.setStatus("PENDING");
        leaveRequest.setCreatedAt(LocalDateTime.now());
        leaveRequest.setUpdatedAt(LocalDateTime.now());

        LeaveRequest savedRequest = leaveRequestRepository.save(leaveRequest);

        notificationService.createLeaveRequestNotification(
                leaveRequest.getApproverId(),
                savedRequest.getId()
        );

        return savedRequest;
    }

    @Override
    public LeaveRequest approveLeaveRequest(String leaveRequestId, String approverId, String comments) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(leaveRequestId);

        if (leaveRequestOpt.isPresent()) {
            LeaveRequest leaveRequest = leaveRequestOpt.get();

            if (!"PENDING".equals(leaveRequest.getStatus())) {
                throw new IllegalStateException("Leave request is not in pending state");
            }

            leaveRequest.setStatus("APPROVED");
            leaveRequest.setApproverId(approverId);
            leaveRequest.setApproverComments(comments);
            leaveRequest.setApprovedTime(LocalDateTime.now());
            leaveRequest.setUpdatedAt(LocalDateTime.now());

            LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);

            leaveBalanceService.deductLeave(
                    leaveRequest.getEmployeeId(),
                    leaveRequest.getLeaveTypeId(),
                    leaveRequest.getStartDate().getYear(),
                    leaveRequest.getDuration(),
                    leaveRequestId
            );

            notificationService.createLeaveApprovalNotification(
                    leaveRequest.getEmployeeId(),
                    leaveRequestId,
                    true
            );

            return updatedRequest;
        }

        return null;
    }

    @Override
    public LeaveRequest rejectLeaveRequest(String leaveRequestId, String approverId, String comments) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(leaveRequestId);

        if (leaveRequestOpt.isPresent()) {
            LeaveRequest leaveRequest = leaveRequestOpt.get();

            if (!"PENDING".equals(leaveRequest.getStatus())) {
                throw new IllegalStateException("Leave request is not in pending state");
            }

            leaveRequest.setStatus("REJECTED");
            leaveRequest.setApproverId(approverId);
            leaveRequest.setApproverComments(comments);
            leaveRequest.setApprovedTime(LocalDateTime.now());
            leaveRequest.setUpdatedAt(LocalDateTime.now());

            LeaveRequest updatedRequest = leaveRequestRepository.save(leaveRequest);

            notificationService.createLeaveApprovalNotification(
                    leaveRequest.getEmployeeId(),
                    leaveRequestId,
                    false
            );

            return updatedRequest;
        }

        return null;
    }

    @Override
    public LeaveRequest cancelLeaveRequest(String leaveRequestId, String cancellationReason) {
        Optional<LeaveRequest> leaveRequestOpt = leaveRequestRepository.findById(leaveRequestId);

        if (leaveRequestOpt.isPresent()) {
            LeaveRequest leaveRequest = leaveRequestOpt.get();

            if ("APPROVED".equals(leaveRequest.getStatus())) {
                leaveBalanceService.refundLeave(
                        leaveRequest.getEmployeeId(),
                        leaveRequest.getLeaveTypeId(),
                        leaveRequest.getStartDate().getYear(),
                        leaveRequest.getDuration(),
                        leaveRequestId
                );
            }

            leaveRequest.setStatus("CANCELLED");
            leaveRequest.setCancelled(true);
            leaveRequest.setCancelledTime(LocalDateTime.now());
            leaveRequest.setCancellationReason(cancellationReason);
            leaveRequest.setUpdatedAt(LocalDateTime.now());

            return leaveRequestRepository.save(leaveRequest);
        }

        return null;
    }

    @Override
    public LeaveRequest updateLeaveRequest(LeaveRequest leaveRequest) {
        leaveRequest.setUpdatedAt(LocalDateTime.now());
        return leaveRequestRepository.save(leaveRequest);
    }

    @Override
    public void deleteLeaveRequest(String id) {
        leaveRequestRepository.deleteById(id);
    }

    @Override
    public double calculateLeaveDuration(LocalDate startDate, LocalDate endDate, boolean halfDay, String halfDayType) {
        if (halfDay) {
            return 0.5;
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        double workingDays = 0;

        for (int i = 0; i < totalDays; i++) {
            LocalDate currentDate = startDate.plusDays(i);

            DayOfWeek dayOfWeek = currentDate.getDayOfWeek();
            if (dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY) {
                boolean isHoliday = holidayRepository.findByDate(currentDate).isPresent();

                if (!isHoliday) {
                    workingDays++;
                }
            }
        }

        return workingDays;
    }

    @Override
    public boolean isLeaveOverlapping(String employeeId, LocalDate startDate, LocalDate endDate, String currentLeaveRequestId) {
        List<LeaveRequest> existingLeaves = leaveRequestRepository.findByEmployeeId(employeeId)
                .stream()
                .filter(leave -> !leave.getId().equals(currentLeaveRequestId))
                .filter(leave -> "APPROVED".equals(leave.getStatus()) || "PENDING".equals(leave.getStatus()))
                .collect(Collectors.toList());

        for (LeaveRequest existingLeave : existingLeaves) {
            LocalDate existingStart = existingLeave.getStartDate();
            LocalDate existingEnd = existingLeave.getEndDate();

            if (!(endDate.isBefore(existingStart) || startDate.isAfter(existingEnd))) {
                return true;
            }
        }

        return false;
    }

    @Override
    public boolean isEmployeeEligibleForLeave(String employeeId, String leaveTypeId, double duration) {
        double availableBalance = leaveBalanceService.getAvailableLeaveBalance(
                employeeId,
                leaveTypeId,
                LocalDate.now().getYear()
        );

        return availableBalance >= duration;
    }
}