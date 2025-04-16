package com.example.leave_management.controller;

import com.example.leave_management.dto.response.ApiResponse;
import com.example.leave_management.model.Holiday;
import com.example.leave_management.repository.HolidayRepository;
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

@RestController
@RequestMapping("/api/holidays")
public class HolidayController {
    private final HolidayRepository holidayRepository;

    @Autowired
    public HolidayController(HolidayRepository holidayRepository) {
        this.holidayRepository = holidayRepository;
    }

    @GetMapping
    public ResponseEntity<List<Holiday>> getAllHolidays() {
        List<Holiday> holidays = holidayRepository.findAll();
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Holiday> getHolidayById(@PathVariable String id) {
        return holidayRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/year/{year}")
    public ResponseEntity<List<Holiday>> getHolidaysByYear(@PathVariable int year) {
        List<Holiday> holidays = holidayRepository.findByYear(year);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<List<Holiday>> getHolidaysByType(@PathVariable String type) {
        List<Holiday> holidays = holidayRepository.findByType(type);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<Holiday>> getHolidaysInDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<Holiday> holidays = holidayRepository.findByDateBetween(startDate, endDate);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/date")
    public ResponseEntity<Holiday> getHolidayByDate(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return holidayRepository.findByDate(date)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/recurring")
    public ResponseEntity<List<Holiday>> getRecurringHolidays() {
        List<Holiday> holidays = holidayRepository.findByRecurring(true);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/restricted")
    public ResponseEntity<List<Holiday>> getRestrictedHolidays() {
        List<Holiday> holidays = holidayRepository.findByRestrictedHoliday(true);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<Holiday>> getHolidaysByDepartment(@PathVariable String departmentId) {
        List<Holiday> holidays = holidayRepository.findByApplicableDepartmentsContaining(departmentId);
        return ResponseEntity.ok(holidays);
    }

    @GetMapping("/location/{location}")
    public ResponseEntity<List<Holiday>> getHolidaysByLocation(@PathVariable String location) {
        List<Holiday> holidays = holidayRepository.findByApplicableLocationsContaining(location);
        return ResponseEntity.ok(holidays);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Holiday> createHoliday(@RequestBody Holiday holiday) {
        Holiday savedHoliday = holidayRepository.save(holiday);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedHoliday);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<Holiday> updateHoliday(@PathVariable String id, @RequestBody Holiday holiday) {
        return holidayRepository.findById(id)
                .map(existingHoliday -> {
                    holiday.setId(id);
                    Holiday updatedHoliday = holidayRepository.save(holiday);
                    return ResponseEntity.ok(updatedHoliday);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('HR')")
    public ResponseEntity<ApiResponse> deleteHoliday(@PathVariable String id) {
        return holidayRepository.findById(id)
                .map(holiday -> {
                    holidayRepository.deleteById(id);
                    return ResponseEntity.ok(new ApiResponse(true, "Holiday deleted successfully"));
                })
                .orElse(ResponseEntity.notFound().build());
    }
}