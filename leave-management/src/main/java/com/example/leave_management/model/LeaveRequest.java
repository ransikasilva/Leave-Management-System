package com.example.leave_management.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leaveRequests")
public class LeaveRequest {
    @Id
    private String id;

    private String employeeId;

    private String leaveTypeId;

    private String departmentId;

    private LocalDate startDate;

    private LocalDate endDate;

    private double duration;

    private String reason;

    private String status;

    private String approverId;

    private LocalDateTime approvedTime;

    private String approverComments;

    private List<String> attachments = new ArrayList<>();

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private boolean halfDay;

    private String halfDayType;

    private boolean urgent;

    private String contactDetails;

    private boolean cancelled;

    private LocalDateTime cancelledTime;

    private String cancellationReason;
}