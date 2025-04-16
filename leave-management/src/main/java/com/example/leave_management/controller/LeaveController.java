package com.example.leave_management.controller;

import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.model.LeaveRequest;
import com.example.leave_management.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/leaves")
public class LeaveController {
    private final LeaveService leaveService;

    @Autowired
    public LeaveController(LeaveService leaveService) {
        this.leaveService = leaveService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<LeaveRequest>> getAllLeaveRequests() {
        List<LeaveRequest> leaveRequests = leaveService.findAllLeaveRequests();
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @leaveRequestAuthorization.isRequesterOrApprover(#id)")
    public ResponseEntity<LeaveRequest> getLeaveRequestById(@PathVariable String id) {
        return leaveService.findLeaveRequestById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @authenticationFacade.getEmployeeId() == #employeeId")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByEmployee(@PathVariable String employeeId) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsByEmployee(employeeId);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/employee/{employeeId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @authenticationFacade.getEmployeeId() == #employeeId")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByEmployeeAndStatus(
            @PathVariable String employeeId, @PathVariable String status) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsByEmployeeAndStatus(employeeId, status);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/approver/{approverId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @authenticationFacade.getEmployeeId() == #approverId")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByApprover(@PathVariable String approverId) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsByApprover(approverId);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/approver/{approverId}/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @authenticationFacade.getEmployeeId() == #approverId")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByApproverAndStatus(
            @PathVariable String approverId, @PathVariable String status) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsByApproverAndStatus(approverId, status);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByStatus(@PathVariable String status) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsByStatus(status);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/type/{leaveTypeId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsByLeaveType(@PathVariable String leaveTypeId) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsByLeaveType(leaveTypeId);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequest>> getLeaveRequestsInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<LeaveRequest> leaveRequests = leaveService.findLeaveRequestsInDateRange(startDate, endDate);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/overlapping")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER')")
    public ResponseEntity<List<LeaveRequest>> getOverlappingLeaveRequests(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<LeaveRequest> leaveRequests = leaveService.findOverlappingLeaveRequests(startDate, endDate);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/employee/{employeeId}/date-range")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or hasRole('MANAGER') or @authenticationFacade.getEmployeeId() == #employeeId")
    public ResponseEntity<List<LeaveRequest>> getEmployeeLeaveRequestsInDateRange(
            @PathVariable String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<LeaveRequest> leaveRequests = leaveService.findEmployeeLeaveRequestsInDateRange(employeeId, startDate, endDate);
        return ResponseEntity.ok(leaveRequests);
    }

    @GetMapping("/department/{departmentId}/pending")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @departmentAuthorization.isHeadOfDepartment(#departmentId)")
    public ResponseEntity<List<LeaveRequest>> getPendingLeaveRequestsByDepartment(@PathVariable String departmentId) {
        List<LeaveRequest> leaveRequests = leaveService.findPendingLeaveRequestsByDepartment(departmentId);
        return ResponseEntity.ok(leaveRequests);
    }

    @PostMapping
    public ResponseEntity<LeaveRequest> submitLeaveRequest(@RequestBody LeaveRequest leaveRequest) {
        LeaveRequest savedLeaveRequest = leaveService.submitLeaveRequest(leaveRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedLeaveRequest);
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @leaveRequestAuthorization.isApprover(#id)")
    public ResponseEntity<LeaveRequest> approveLeaveRequest(
            @PathVariable String id,
            @RequestParam String approverId,
            @RequestParam(required = false) String comments) {
        LeaveRequest approvedLeaveRequest = leaveService.approveLeaveRequest(id, approverId, comments);
        return ResponseEntity.ok(approvedLeaveRequest);
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @leaveRequestAuthorization.isApprover(#id)")
    public ResponseEntity<LeaveRequest> rejectLeaveRequest(
            @PathVariable String id,
            @RequestParam String approverId,
            @RequestParam String comments) {
        LeaveRequest rejectedLeaveRequest = leaveService.rejectLeaveRequest(id, approverId, comments);
        return ResponseEntity.ok(rejectedLeaveRequest);
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @leaveRequestAuthorization.isRequester(#id)")
    public ResponseEntity<LeaveRequest> cancelLeaveRequest(
            @PathVariable String id,
            @RequestParam String cancellationReason) {
        LeaveRequest cancelledLeaveRequest = leaveService.cancelLeaveRequest(id, cancellationReason);
        return ResponseEntity.ok(cancelledLeaveRequest);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR') or @leaveRequestAuthorization.isRequester(#id)")
    public ResponseEntity<LeaveRequest> updateLeaveRequest(
            @PathVariable String id,
            @RequestBody LeaveRequest leaveRequest) {
        Optional<LeaveRequest> optionalLeaveRequest = leaveService.findLeaveRequestById(id);
        if (optionalLeaveRequest.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        LeaveRequest existingLeaveRequest = optionalLeaveRequest.get();
        if (!"PENDING".equals(existingLeaveRequest.getStatus())) {
            return ResponseEntity.badRequest().build();
        }

        leaveRequest.setId(id);
        LeaveRequest updatedLeaveRequest = leaveService.updateLeaveRequest(leaveRequest);
        return ResponseEntity.ok(updatedLeaveRequest);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteLeaveRequest(@PathVariable String id) {
        return leaveService.findLeaveRequestById(id)
                .map(leaveRequest -> {
                    leaveService.deleteLeaveRequest(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Leave request deleted successfully"));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/check-eligibility")
    public ResponseEntity<ApiResponse> checkLeaveEligibility(
            @RequestParam String employeeId,
            @RequestParam String leaveTypeId,
            @RequestParam double duration) {
        boolean isEligible = leaveService.isEmployeeEligibleForLeave(employeeId, leaveTypeId, duration);
        return ResponseEntity.ok(new ApiResponse(isEligible,
                isEligible ? "Employee is eligible for the leave" : "Employee does not have sufficient leave balance"));
    }

    @GetMapping("/check-overlap")
    public ResponseEntity<ApiResponse> checkLeaveOverlap(
            @RequestParam String employeeId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(required = false) String currentLeaveRequestId) {
        boolean isOverlapping = leaveService.isLeaveOverlapping(employeeId, startDate, endDate,
                currentLeaveRequestId != null ? currentLeaveRequestId : "");
        return ResponseEntity.ok(new ApiResponse(!isOverlapping,
                isOverlapping ? "Leave dates overlap with existing leave requests" : "No overlapping leave requests"));
    }

    @GetMapping("/calculate-duration")
    public ResponseEntity<Double> calculateLeaveDuration(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(defaultValue = "false") boolean halfDay,
            @RequestParam(required = false) String halfDayType) {
        double duration = leaveService.calculateLeaveDuration(startDate, endDate, halfDay, halfDayType);
        return ResponseEntity.ok(duration);
    }
}