package com.example.leave_management.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "leaveTypes")
public class LeaveType {
    @Id
    private String id;

    private String name;

    private String description;

    private double defaultDays;

    private boolean paidLeave;

    private boolean requiresApproval;

    private boolean active;

    private String color;

    private boolean allowHalfDay;

    private boolean carryForward;

    private double maxCarryForwardDays;

    private boolean encashable;

    private boolean requiresAttachment;

    private boolean requiresReason;

    private boolean isRestricted;

    private int maxContinuousDays;

    private int applicationAdvanceDays;

    private int applicationCutOffDays;
}