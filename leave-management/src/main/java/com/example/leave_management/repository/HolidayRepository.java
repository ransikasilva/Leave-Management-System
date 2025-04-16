package com.example.leave_management.repository;

import com.example.leave_management.model.Holiday;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HolidayRepository extends MongoRepository<Holiday, String> {
    List<Holiday> findByYear(int year);

    List<Holiday> findByType(String type);

    List<Holiday> findByDateBetween(LocalDate start, LocalDate end);

    Optional<Holiday> findByDate(LocalDate date);

    List<Holiday> findByRecurring(boolean recurring);

    List<Holiday> findByRestrictedHoliday(boolean restrictedHoliday);

    List<Holiday> findByApplicableDepartmentsContaining(String departmentId);

    List<Holiday> findByApplicableLocationsContaining(String location);
}