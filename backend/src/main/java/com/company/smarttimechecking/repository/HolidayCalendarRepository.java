package com.company.smarttimechecking.repository;

import com.company.smarttimechecking.domain.entity.HolidayCalendar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayCalendarRepository extends JpaRepository<HolidayCalendar, String> {
    List<HolidayCalendar> findByHolidayYear(Integer holidayYear);
    List<HolidayCalendar> findByStartDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date1, LocalDate date2);
}

