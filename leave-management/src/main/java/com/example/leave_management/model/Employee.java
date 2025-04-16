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
@Document(collection = "employees")
public class Employee {
    @Id
    private String id;

    private String userId;

    private String firstName;

    private String lastName;

    private String email;

    private String phoneNumber;

    private String departmentId;

    private String designation;

    private String managerId;

    private LocalDate joiningDate;

    private LocalDate probationEndDate;

    private String employmentType;

    private String employeeId;

    private String address;

    private String city;

    private String state;

    private String country;

    private String zipCode;

    private LocalDate dateOfBirth;

    private String gender;

    private List<String> emergencyContacts = new ArrayList<>();

    private boolean active = true;

    private LocalDate terminationDate;
}