package com.histry.content.kafka;

import com.histry.content.model.Event;
import com.histry.content.model.EventTranslation;
import com.histry.content.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Consumes suggestion-approved events and creates new events in content DB.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class SuggestionApprovedConsumer {

    private final EventRepository eventRepository;

    @KafkaListener(topics = "suggestion-approved", groupId = "content-service")
    @Transactional
    public void handle(Map<String, Object> payload) {
        log.info("Received suggestion-approved event: {}", payload.get("suggestionId"));

        try {
            Event event = Event.builder()
                    .displayDate(LocalDate.parse((String) payload.get("displayDate")))
                    .eventYear(Integer.parseInt(payload.get("eventYear").toString()))
                    .locationName((String) payload.get("locationName"))
                    .latitude(payload.get("latitude") != null ? Double.parseDouble(payload.get("latitude").toString()) : null)
                    .longitude(payload.get("longitude") != null ? Double.parseDouble(payload.get("longitude").toString()) : null)
                    .youtubeUrl((String) payload.get("youtubeUrl"))
                    .build();

            String locale = (String) payload.getOrDefault("locale", "tr");
            EventTranslation translation = EventTranslation.builder()
                    .event(event)
                    .locale(locale)
                    .title((String) payload.get("title"))
                    .description((String) payload.get("description"))
                    .build();

            event.setTranslations(new ArrayList<>(List.of(translation)));
            eventRepository.save(event);

            log.info("Created event from suggestion {} for display_date={}",
                    payload.get("suggestionId"), payload.get("displayDate"));
        } catch (Exception e) {
            log.error("Failed to process suggestion-approved event", e);
        }
    }
}
