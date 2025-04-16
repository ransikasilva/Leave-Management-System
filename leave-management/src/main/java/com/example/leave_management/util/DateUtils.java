package com.example.leave_management.util;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

public class DateUtils {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static String formatDate(LocalDate date) {
        if (date == null) {
            return null;
        }
        return date.format(DATE_FORMATTER);
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        if (dateTime == null) {
            return null;
        }
        return dateTime.format(DATE_TIME_FORMATTER);
    }

    public static LocalDate parseDate(String dateString) {
        if (dateString == null || dateString.isEmpty()) {
            return null;
        }
        return LocalDate.parse(dateString, DATE_FORMATTER);
    }

    public static LocalDateTime parseDateTime(String dateTimeString) {
        if (dateTimeString == null || dateTimeString.isEmpty()) {
            return null;
        }
        return LocalDateTime.parse(dateTimeString, DATE_TIME_FORMATTER);
    }

    public static boolean isWeekend(LocalDate date) {
        DayOfWeek dayOfWeek = date.getDayOfWeek();
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }

    public static long calculateBusinessDays(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return 0;
        }

        if (startDate.isAfter(endDate)) {
            return 0;
        }

        long totalDays = ChronoUnit.DAYS.between(startDate, endDate) + 1;
        long weekends = 0;

        for (int i = 0; i < totalDays; i++) {
            LocalDate currentDate = startDate.plusDays(i);
            if (isWeekend(currentDate)) {
                weekends++;
            }
        }

        return totalDays - weekends;
    }

    public static List<LocalDate> getDatesBetween(LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();

        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            return dates;
        }

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            dates.add(current);
            current = current.plusDays(1);
        }

        return dates;
    }

    public static List<LocalDate> getBusinessDatesBetween(LocalDate startDate, LocalDate endDate) {
        List<LocalDate> dates = new ArrayList<>();

        if (startDate == null || endDate == null || startDate.isAfter(endDate)) {
            return dates;
        }

        LocalDate current = startDate;
        while (!current.isAfter(endDate)) {
            if (!isWeekend(current)) {
                dates.add(current);
            }
            current = current.plusDays(1);
        }

        return dates;
    }

    public static LocalDate getFirstDayOfMonth(int year, int month) {
        return LocalDate.of(year, month, 1);
    }

    public static LocalDate getLastDayOfMonth(int year, int month) {
        LocalDate firstDay = getFirstDayOfMonth(year, month);
        return firstDay.withDayOfMonth(firstDay.lengthOfMonth());
    }

    public static LocalDate getFirstDayOfYear(int year) {
        return LocalDate.of(year, Month.JANUARY, 1);
    }

    public static LocalDate getLastDayOfYear(int year) {
        return LocalDate.of(year, Month.DECEMBER, 31);
    }

    public static int getCurrentYear() {
        return LocalDate.now().getYear();
    }

    public static int getCurrentMonth() {
        return LocalDate.now().getMonthValue();
    }

    public static LocalDate getCurrentDate() {
        return LocalDate.now();
    }

    public static LocalDateTime getCurrentDateTime() {
        return LocalDateTime.now();
    }
}