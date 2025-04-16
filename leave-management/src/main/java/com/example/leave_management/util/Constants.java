package com.example.leave_management.util;

import io.jsonwebtoken.security.Keys;
import java.util.Base64;

public class Constants {

    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_HR = "ROLE_HR";
    public static final String ROLE_MANAGER = "ROLE_MANAGER";
    public static final String ROLE_EMPLOYEE = "ROLE_EMPLOYEE";
    public static final String ROLE_USER = "ROLE_USER";

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_APPROVED = "APPROVED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    public static final String LEAVE_TYPE_ANNUAL = "Annual Leave";
    public static final String LEAVE_TYPE_SICK = "Sick Leave";
    public static final String LEAVE_TYPE_PERSONAL = "Personal Leave";
    public static final String LEAVE_TYPE_MATERNITY = "Maternity Leave";
    public static final String LEAVE_TYPE_PATERNITY = "Paternity Leave";
    public static final String LEAVE_TYPE_BEREAVEMENT = "Bereavement Leave";
    public static final String LEAVE_TYPE_UNPAID = "Unpaid Leave";

    public static final String HALF_DAY_TYPE_FIRST_HALF = "FIRST_HALF";
    public static final String HALF_DAY_TYPE_SECOND_HALF = "SECOND_HALF";

    public static final String HOLIDAY_TYPE_PUBLIC = "PUBLIC";
    public static final String HOLIDAY_TYPE_COMPANY = "COMPANY";
    public static final String HOLIDAY_TYPE_OPTIONAL = "OPTIONAL";

    public static final String NOTIFICATION_TYPE_LEAVE_REQUEST = "LEAVE_REQUEST";
    public static final String NOTIFICATION_TYPE_LEAVE_APPROVAL = "LEAVE_APPROVAL";
    public static final String NOTIFICATION_TYPE_LEAVE_REJECTION = "LEAVE_REJECTION";
    public static final String NOTIFICATION_TYPE_LEAVE_CANCELLATION = "LEAVE_CANCELLATION";
    public static final String NOTIFICATION_TYPE_SYSTEM = "SYSTEM";

    public static final String NOTIFICATION_PRIORITY_HIGH = "HIGH";
    public static final String NOTIFICATION_PRIORITY_MEDIUM = "MEDIUM";
    public static final String NOTIFICATION_PRIORITY_LOW = "LOW";

    public static final String NOTIFICATION_ACTION_APPROVE_REJECT = "APPROVE_REJECT";
    public static final String NOTIFICATION_ACTION_VIEW = "VIEW";

    public static final String TOKEN_PREFIX = "Bearer ";
    public static final String HEADER_STRING = "Authorization";

    public static final long ACCESS_TOKEN_VALIDITY = 60 * 60 * 1000; // 1 hour
    public static final long REFRESH_TOKEN_VALIDITY = 7 * 24 * 60 * 60 * 1000; // 7 days

    // Secure token secret (512 bits / 64 characters minimum for HS512)
    public static final String TOKEN_SECRET = "dW4xJw7AOPqDELf2TfXMn5vI8zGrBy6pKoCsZkV3cHNgiQJS9aYeRFbUht0lx4uq"
            + "5v8DgTpwxCK3jVLtXY2mBnF7rEP0H6laZWoQ1U9sGdc4kKbOM";

    public static final int PASSWORD_RESET_EXPIRATION = 24 * 60 * 60; // 24 hours in seconds

    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final int MAX_PAGE_SIZE = 100;

    public static final String DEFAULT_SORT_BY = "createdAt";
    public static final String DEFAULT_SORT_DIRECTION = "desc";

    private Constants() {
        // Private constructor to prevent instantiation
    }
}