package com.histry.content.repository;

import com.histry.content.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EventRepository extends JpaRepository<Event, UUID> {

    /**
     * Step 1: Exact match for today's full date (year + month + day).
     */
    Optional<Event> findByDisplayDateAndIsActiveTrue(LocalDate displayDate);

    /**
     * Step 2 (fallback): Most recent event for this month+day, any year.
     * Hibernate 6 supports EXTRACT natively in JPQL without FUNCTION() wrapper.
     */
    @Query("""
        SELECT e FROM Event e
        WHERE EXTRACT(MONTH FROM e.displayDate) = :month
          AND EXTRACT(DAY FROM e.displayDate) = :day
          AND e.isActive = true
        ORDER BY e.displayDate DESC
        """)
    List<Event> findByMonthAndDayOrderByDisplayDateDesc(
            @Param("month") int month,
            @Param("day") int day
    );
}
