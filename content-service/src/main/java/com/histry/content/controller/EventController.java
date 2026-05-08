package com.histry.content.controller;

import com.histry.content.dto.EventResponse;
import com.histry.content.model.Event;
import com.histry.content.model.EventSource;
import com.histry.content.model.EventTranslation;
import com.histry.content.repository.EventRepository;
import com.histry.content.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/content")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final EventRepository eventRepository;

    /**
     * Public: Returns today's event WITHOUT event_year.
     */
    @GetMapping("/today")
    public ResponseEntity<EventResponse> getToday(
            @RequestParam(defaultValue = "en") String locale) {
        return ResponseEntity.ok(eventService.getTodayEvent(locale));
    }

    /**
     * Public: Returns today's full event WITH event_year (called after game ends).
     */
    @GetMapping("/today/reveal")
    public ResponseEntity<?> getTodayRevealed(
            @RequestParam(defaultValue = "en") String locale) {
        EventResponse base = eventService.getTodayEventRevealed(locale);
        // Get the year separately for the reveal
        int correctYear = eventService.getTodayCorrectYear();

        return ResponseEntity.ok(Map.of(
                "event", base,
                "correctYear", correctYear
        ));
    }

    /**
     * Internal: Used by Game Service to get the correct year for today.
     */
    @GetMapping("/today/correct-year")
    public ResponseEntity<Map<String, Integer>> getCorrectYear() {
        return ResponseEntity.ok(Map.of("correctYear", eventService.getTodayCorrectYear()));
    }
}
