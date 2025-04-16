package com.example.leave_management.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "departments")
public class Department {
    @Id
    private String id;

    private String name;

    private String description;

    private String departmentCode;

    private String headOfDepartmentId;

    private List<String> employeeIds = new ArrayList<>();

    private String parentDepartmentId;

    private List<String> childDepartmentIds = new ArrayList<>();

    private String location;

    private String contactEmail;

    private String contactPhone;

    private boolean active = true;
}