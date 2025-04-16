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
@Document(collection = "holidays")
public class Holiday {
    @Id
    private String id;

    private String name;

    private String description;

    private LocalDate date;

    private boolean recurring;

    private String type;

    private int year;

    private List<String> applicableDepartments = new ArrayList<>();

    private List<String> applicableLocations = new ArrayList<>();

    private boolean restrictedHoliday;

    private boolean halfDay;

    private String halfDayType;
}