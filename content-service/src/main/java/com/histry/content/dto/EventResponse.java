package com.histry.content.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Public DTO — event_year is intentionally excluded.
 * Only exposed after game completion via /content/today/reveal.
 */
@Data
@Builder
public class EventResponse {
    private UUID id;
    private String displayDate;     // "2026-05-07" full date
    private String locale;
    private String title;
    private String description;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private String youtubeUrl;
    private String imageUrl;
    private List<SourceDto> sources;

    @Data
    @Builder
    public static class SourceDto {
        private String title;
        private String url;
    }
}
