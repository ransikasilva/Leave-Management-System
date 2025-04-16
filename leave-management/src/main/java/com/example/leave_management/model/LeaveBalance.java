package com.example.leave_management.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leaveBalances")
public class LeaveBalance {
    @Id
    private String id;

    private String employeeId;

    private String leaveTypeId;

    private int year;

    private double totalAllocated;

    private double used;

    private double pending;

    private double available;

    private double carryForwarded;

    private double adjustment;

    private String adjustmentReason;

    private LocalDate adjustmentDate;

    private String adjustmentApprovedBy;

    private List<BalanceHistory> history = new ArrayList<>();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BalanceHistory {
        private LocalDate date;
        private String action;
        private double value;
        private String referenceId;
        private String description;
    }
}