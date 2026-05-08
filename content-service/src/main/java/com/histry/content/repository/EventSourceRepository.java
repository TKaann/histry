package com.histry.content.repository;

import com.histry.content.model.EventSource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface EventSourceRepository extends JpaRepository<EventSource, UUID> {

    @Modifying
    @Query("DELETE FROM EventSource s WHERE s.event.id = :eventId")
    void deleteByEventId(@Param("eventId") UUID eventId);
}
