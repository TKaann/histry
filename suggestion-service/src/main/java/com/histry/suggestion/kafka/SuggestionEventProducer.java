package com.histry.suggestion.kafka;

import com.histry.suggestion.model.Suggestion;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class SuggestionEventProducer {

    private static final String TOPIC = "suggestion-approved";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Published when admin approves a suggestion.
     * Content Service consumes this and creates the event.
     */
    public void publishSuggestionApproved(Suggestion suggestion) {
        // Map.of() has a 10-entry limit — using HashMap for 11 fields
        Map<String, Object> event = new java.util.HashMap<>();
        event.put("suggestionId",  suggestion.getId().toString());
        event.put("userId",        suggestion.getUserId().toString());
        event.put("title",         suggestion.getTitle());
        event.put("description",   suggestion.getDescription());
        event.put("displayDate",   suggestion.getSuggestedDisplayDate().toString());
        event.put("eventYear",     suggestion.getSuggestedEventYear());
        event.put("locationName",  suggestion.getLocationName() != null ? suggestion.getLocationName() : "");
        event.put("latitude",      suggestion.getLatitude()  != null ? suggestion.getLatitude()  : 0.0);
        event.put("longitude",     suggestion.getLongitude() != null ? suggestion.getLongitude() : 0.0);
        event.put("youtubeUrl",    suggestion.getYoutubeUrl() != null ? suggestion.getYoutubeUrl() : "");
        event.put("locale",        suggestion.getLocale());

        kafkaTemplate.send(TOPIC, suggestion.getId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish suggestion-approved for {}", suggestion.getId(), ex);
                    } else {
                        log.info("Published suggestion-approved for {}", suggestion.getId());
                    }
                });
    }
}
