package com.example.leave_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveResponseDto {
    private String id;
    private String employeeId;
    private String employeeName;
    private String leaveTypeId;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private double duration;
    private String reason;
    private String status;
    private String approverId;
    private String approverName;
    private LocalDateTime approvedTime;
    private String approverComments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean halfDay;
    private String halfDayType;
    private boolean urgent;
    private boolean cancelled;
    private String cancellationReason;
    private LocalDateTime cancelledTime;
}