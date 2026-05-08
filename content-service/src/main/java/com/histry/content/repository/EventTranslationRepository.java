package com.histry.content.repository;

import com.histry.content.model.Event;
import com.histry.content.model.EventTranslation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface EventTranslationRepository extends JpaRepository<EventTranslation, UUID> {

    @Modifying
    @Query("DELETE FROM EventTranslation t WHERE t.event.id = :eventId")
    void deleteByEventId(@Param("eventId") UUID eventId);
}
