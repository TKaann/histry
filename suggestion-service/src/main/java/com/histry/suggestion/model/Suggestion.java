package com.histry.suggestion.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "suggestions")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Suggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "suggested_display_date", nullable = false)
    private LocalDate suggestedDisplayDate;

    @Column(name = "suggested_event_year", nullable = false)
    private int suggestedEventYear;

    @Column(name = "location_name")
    private String locationName;

    private Double latitude;
    private Double longitude;

    @Column(name = "youtube_url")
    private String youtubeUrl;

    @Column(name = "source_urls", columnDefinition = "TEXT")
    private String sourceUrls; // JSON string: [{title, url}, ...]

    @Column(nullable = false, length = 5)
    @Builder.Default
    private String locale = "tr";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "admin_note")
    private String adminNote;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { PENDING, APPROVED, REJECTED }
}
