package com.histry.suggestion.service;

import com.histry.suggestion.kafka.SuggestionEventProducer;
import com.histry.suggestion.model.Suggestion;
import com.histry.suggestion.model.SuggestionApplication;
import com.histry.suggestion.repository.SuggestionApplicationRepository;
import com.histry.suggestion.repository.SuggestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final SuggestionRepository suggestionRepository;
    private final SuggestionApplicationRepository applicationRepository;
    private final SuggestionEventProducer eventProducer;

    // ─── Phase 1: Application ──────────────────────────────────

    @Transactional
    public SuggestionApplication apply(UUID userId, String motivation) {
        // Prevent duplicate pending applications
        if (applicationRepository.existsByUserIdAndStatus(userId, SuggestionApplication.Status.PENDING)) {
            throw new IllegalStateException("You already have a pending application");
        }
        SuggestionApplication application = SuggestionApplication.builder()
                .userId(userId)
                .motivation(motivation)
                .build();
        return applicationRepository.save(application);
    }

    // ─── Phase 2: Suggestion ───────────────────────────────────

    @Transactional
    public Suggestion submit(UUID userId, String title, String description,
                             LocalDate displayDate, int eventYear,
                             String locationName, Double lat, Double lng,
                             String youtubeUrl, String sourceUrls, String locale) {
        // Verify user is an approved suggester
        if (!applicationRepository.existsByUserIdAndStatus(userId, SuggestionApplication.Status.APPROVED)) {
            throw new IllegalStateException("You are not approved to submit suggestions");
        }
        Suggestion suggestion = Suggestion.builder()
                .userId(userId)
                .title(title)
                .description(description)
                .suggestedDisplayDate(displayDate)
                .suggestedEventYear(eventYear)
                .locationName(locationName)
                .latitude(lat)
                .longitude(lng)
                .youtubeUrl(youtubeUrl)
                .sourceUrls(sourceUrls)
                .locale(locale)
                .build();
        return suggestionRepository.save(suggestion);
    }

    public List<Suggestion> getMySuggestions(UUID userId) {
        return suggestionRepository.findByUserId(userId);
    }

    // ─── Admin operations ─────────────────────────────────────

    public List<SuggestionApplication> getPendingApplications() {
        return applicationRepository.findByStatus(SuggestionApplication.Status.PENDING);
    }

    @Transactional
    public SuggestionApplication reviewApplication(UUID applicationId, boolean approved) {
        SuggestionApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        app.setStatus(approved ? SuggestionApplication.Status.APPROVED : SuggestionApplication.Status.REJECTED);
        app.setReviewedAt(LocalDateTime.now());
        return applicationRepository.save(app);
    }

    public List<Suggestion> getPendingSuggestions() {
        return suggestionRepository.findByStatus(Suggestion.Status.PENDING);
    }

    @Transactional
    public Suggestion reviewSuggestion(UUID suggestionId, boolean approved, String adminNote) {
        Suggestion suggestion = suggestionRepository.findById(suggestionId)
                .orElseThrow(() -> new RuntimeException("Suggestion not found"));
        suggestion.setStatus(approved ? Suggestion.Status.APPROVED : Suggestion.Status.REJECTED);
        suggestion.setAdminNote(adminNote);
        suggestion.setReviewedAt(LocalDateTime.now());
        suggestionRepository.save(suggestion);

        if (approved) {
            // Publish Kafka event → Content Service will create the event
            eventProducer.publishSuggestionApproved(suggestion);
        }
        return suggestion;
    }
}
