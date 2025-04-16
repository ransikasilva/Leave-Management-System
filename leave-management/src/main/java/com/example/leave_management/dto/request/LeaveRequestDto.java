package com.example.leave_management.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestDto {
    private String employeeId;
    private String leaveTypeId;
    private LocalDate startDate;
    private LocalDate endDate;
    private String reason;
    private String approverId;
    private boolean halfDay;
    private String halfDayType;
    private boolean urgent;
    private String contactDetails;
}