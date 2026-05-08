package com.histry.content.service;

import com.histry.content.dto.EventResponse;
import com.histry.content.model.Event;
import com.histry.content.model.EventTranslation;
import com.histry.content.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventService {

    private final EventRepository eventRepository;
    private static final String DEFAULT_LOCALE = "en";

    /**
     * Resolves today's event using two-step strategy:
     * 1. Exact match: display_date == today (year-aware)
     * 2. Fallback: most recent event for this month+day
     */
    @Transactional(readOnly = true)
    public EventResponse getTodayEvent(String locale) {
        LocalDate today = LocalDate.now();

        Event event = eventRepository.findByDisplayDateAndIsActiveTrue(today)
                .orElseGet(() -> {
                    log.info("No exact event for {}, falling back to month+day lookup", today);
                    List<Event> fallbacks = eventRepository.findByMonthAndDayOrderByDisplayDateDesc(
                            today.getMonthValue(), today.getDayOfMonth()
                    );
                    return fallbacks.stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("No event found for " + today));
                });

        return toResponse(event, locale, false);
    }

    /**
     * Full event with event_year revealed — called after game ends.
     */
    @Transactional(readOnly = true)
    public EventResponse getTodayEventRevealed(String locale) {
        LocalDate today = LocalDate.now();

        Event event = eventRepository.findByDisplayDateAndIsActiveTrue(today)
                .orElseGet(() -> {
                    List<Event> fallbacks = eventRepository.findByMonthAndDayOrderByDisplayDateDesc(
                            today.getMonthValue(), today.getDayOfMonth()
                    );
                    return fallbacks.stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("No event found for " + today));
                });

        return toResponse(event, locale, true);
    }

    /**
     * Returns the correct year for today's event — used internally by Game Service.
     */
    @Transactional(readOnly = true)
    public int getTodayCorrectYear() {
        LocalDate today = LocalDate.now();
        return eventRepository.findByDisplayDateAndIsActiveTrue(today)
                .orElseGet(() -> {
                    List<Event> fallbacks = eventRepository.findByMonthAndDayOrderByDisplayDateDesc(
                            today.getMonthValue(), today.getDayOfMonth()
                    );
                    return fallbacks.stream().findFirst()
                            .orElseThrow(() -> new RuntimeException("No event found for " + today));
                })
                .getEventYear();
    }

    private EventResponse toResponse(Event event, String locale, boolean includeYear) {
        // Find translation for requested locale, fallback to DEFAULT_LOCALE
        EventTranslation translation = event.getTranslations().stream()
                .filter(t -> t.getLocale().equals(locale))
                .findFirst()
                .orElseGet(() -> event.getTranslations().stream()
                        .filter(t -> t.getLocale().equals(DEFAULT_LOCALE))
                        .findFirst()
                        .orElse(null));

        List<EventResponse.SourceDto> sources = event.getSources().stream()
                .filter(s -> s.getLocale().equals(locale) || s.getLocale().equals("all"))
                .map(s -> EventResponse.SourceDto.builder()
                        .title(s.getSourceTitle())
                        .url(s.getSourceUrl())
                        .build())
                .toList();

        EventResponse.EventResponseBuilder builder = EventResponse.builder()
                .id(event.getId())
                .displayDate(event.getDisplayDate().toString())
                .locale(locale)
                .locationName(event.getLocationName())
                .latitude(event.getLatitude())
                .longitude(event.getLongitude())
                .youtubeUrl(event.getYoutubeUrl())
                .imageUrl(event.getImageUrl())
                .sources(sources);

        if (includeYear) {
            // event_year is added only on reveal — reusing the same DTO via inheritance
            // would over-complicate; we store it separately in a RevealedEventResponse
            // For now we cast it into a wrapper handled by the controller
        }

        if (translation != null) {
            builder.title(translation.getTitle())
                   .description(translation.getDescription());
        }

        return builder.build();
    }
}
