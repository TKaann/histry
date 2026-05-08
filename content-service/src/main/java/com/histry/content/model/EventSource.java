package com.histry.content.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "event_sources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventSource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    @JsonIgnore  // break bidirectional serialization cycle
    private Event event;

    @Column(nullable = false, length = 5)
    @Builder.Default
    private String locale = "all";  // 'all' = language-agnostic

    @Column(name = "source_title", nullable = false, length = 255)
    private String sourceTitle;

    @Column(name = "source_url", nullable = false, length = 500)
    private String sourceUrl;
}
