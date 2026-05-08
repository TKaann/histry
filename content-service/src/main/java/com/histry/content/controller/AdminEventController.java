package com.histry.content.controller;

import com.histry.content.model.Event;
import com.histry.content.model.EventTranslation;
import com.histry.content.model.EventSource;
import com.histry.content.repository.EventRepository;
import com.histry.content.repository.EventTranslationRepository;
import com.histry.content.repository.EventSourceRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin-only event management.
 * X-User-Role=ADMIN is enforced at the Gateway level.
 */
@RestController
@RequestMapping("/admin/events")
@RequiredArgsConstructor
public class AdminEventController {

    private final EventRepository            eventRepository;
    private final EventTranslationRepository translationRepository;
    private final EventSourceRepository      sourceRepository;

    @GetMapping
    public ResponseEntity<List<Event>> listAll() {
        return ResponseEntity.ok(eventRepository.findAll());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<Event> create(@RequestBody Map<String, Object> body) {
        Event event = Event.builder()
                .displayDate(LocalDate.parse((String) body.get("displayDate")))
                .eventYear(Integer.parseInt(body.get("eventYear").toString()))
                .locationName((String) body.getOrDefault("locationName", null))
                .latitude(body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : null)
                .longitude(body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : null)
                .youtubeUrl((String) body.getOrDefault("youtubeUrl", null))
                .imageUrl((String) body.getOrDefault("imageUrl", null))
                .build();

        // Translations
        if (body.containsKey("translations")) {
            List<Map<String, String>> translations = (List<Map<String, String>>) body.get("translations");
            for (Map<String, String> t : translations) {
                event.getTranslations().add(EventTranslation.builder()
                        .event(event).locale(t.get("locale"))
                        .title(t.get("title")).description(t.get("description"))
                        .build());
            }
        }

        // Sources
        if (body.containsKey("sources")) {
            List<Map<String, String>> sources = (List<Map<String, String>>) body.get("sources");
            for (Map<String, String> s : sources) {
                event.getSources().add(EventSource.builder()
                        .event(event)
                        .sourceTitle(s.getOrDefault("sourceTitle", "Kaynak"))
                        .sourceUrl(s.get("sourceUrl"))
                        .locale(s.getOrDefault("locale", "all"))
                        .build());
            }
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(eventRepository.save(event));
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<Event> update(@PathVariable UUID id, @RequestBody Map<String, Object> body) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        // Basic fields
        if (body.containsKey("displayDate"))
            event.setDisplayDate(LocalDate.parse((String) body.get("displayDate")));
        if (body.containsKey("eventYear"))
            event.setEventYear(Integer.parseInt(body.get("eventYear").toString()));
        if (body.containsKey("locationName"))
            event.setLocationName((String) body.get("locationName"));
        if (body.containsKey("latitude") && body.get("latitude") != null)
            event.setLatitude(Double.parseDouble(body.get("latitude").toString()));
        if (body.containsKey("longitude") && body.get("longitude") != null)
            event.setLongitude(Double.parseDouble(body.get("longitude").toString()));
        if (body.containsKey("youtubeUrl"))
            event.setYoutubeUrl((String) body.get("youtubeUrl"));
        if (body.containsKey("imageUrl"))
            event.setImageUrl((String) body.get("imageUrl"));

        // Replace translations: explicit DELETE first, then re-insert
        if (body.containsKey("translations")) {
            translationRepository.deleteByEventId(id);   // DELETE old rows
            translationRepository.flush();               // ensure DELETEs fire before INSERTs

            List<Map<String, String>> translations = (List<Map<String, String>>) body.get("translations");
            List<EventTranslation> newList = new ArrayList<>();
            for (Map<String, String> t : translations) {
                newList.add(EventTranslation.builder()
                        .event(event).locale(t.get("locale"))
                        .title(t.get("title")).description(t.get("description"))
                        .build());
            }
            translationRepository.saveAll(newList);
        }

        // Replace sources: explicit DELETE first, then re-insert
        if (body.containsKey("sources")) {
            sourceRepository.deleteByEventId(id);       // DELETE old rows
            sourceRepository.flush();

            List<Map<String, String>> sources = (List<Map<String, String>>) body.get("sources");
            List<EventSource> newList = new ArrayList<>();
            for (Map<String, String> s : sources) {
                newList.add(EventSource.builder()
                        .event(event)
                        .sourceTitle(s.getOrDefault("sourceTitle", "Kaynak"))
                        .sourceUrl(s.get("sourceUrl"))
                        .locale(s.getOrDefault("locale", "all"))
                        .build());
            }
            sourceRepository.saveAll(newList);
        }

        event.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(eventRepository.save(event));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        eventRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<Event> toggleActive(@PathVariable UUID id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        event.setActive(!event.isActive());
        return ResponseEntity.ok(eventRepository.save(event));
    }
}
