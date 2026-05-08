package com.histry.content.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

/**
 * Full event DTO including event_year — only returned after game completion.
 */
@Data
@Builder
public class RevealedEventResponse {
    private UUID id;
    private String displayDate;
    private Integer eventYear;      // Revealed after game ends
    private String locale;
    private String title;
    private String description;
    private String locationName;
    private Double latitude;
    private Double longitude;
    private String youtubeUrl;
    private String imageUrl;
    private List<EventResponse.SourceDto> sources;
}
