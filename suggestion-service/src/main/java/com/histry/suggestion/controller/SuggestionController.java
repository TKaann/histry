package com.histry.suggestion.controller;

import com.histry.suggestion.model.Suggestion;
import com.histry.suggestion.model.SuggestionApplication;
import com.histry.suggestion.service.SuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class SuggestionController {

    private final SuggestionService suggestionService;

    @PostMapping("/suggestions/apply")
    public ResponseEntity<SuggestionApplication> apply(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, String> body) {
        String motivation = body.getOrDefault("motivation", "");
        if (motivation.isBlank()) return ResponseEntity.badRequest().build();
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(suggestionService.apply(UUID.fromString(userId), motivation));
    }

    @PostMapping("/suggestions")
    public ResponseEntity<Suggestion> submit(
            @RequestHeader("X-User-Id") String userId,
            @RequestBody Map<String, Object> body) {
        Suggestion suggestion = suggestionService.submit(
                UUID.fromString(userId),
                (String) body.get("title"),
                (String) body.get("description"),
                LocalDate.parse((String) body.get("suggestedDisplayDate")),
                Integer.parseInt(body.get("suggestedEventYear").toString()),
                (String) body.getOrDefault("locationName", null),
                body.get("latitude") != null ? Double.parseDouble(body.get("latitude").toString()) : null,
                body.get("longitude") != null ? Double.parseDouble(body.get("longitude").toString()) : null,
                (String) body.getOrDefault("youtubeUrl", null),
                (String) body.getOrDefault("sourceUrls", "[]"),
                (String) body.getOrDefault("locale", "tr")
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(suggestion);
    }

    @GetMapping("/suggestions/my")
    public ResponseEntity<List<Suggestion>> mySuggestions(@RequestHeader("X-User-Id") String userId) {
        return ResponseEntity.ok(suggestionService.getMySuggestions(UUID.fromString(userId)));
    }

    @GetMapping("/admin/applicants")
    public ResponseEntity<List<SuggestionApplication>> getPendingApplications() {
        return ResponseEntity.ok(suggestionService.getPendingApplications());
    }

    @PutMapping("/admin/applicants/{id}/approve")
    public ResponseEntity<SuggestionApplication> approveApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(suggestionService.reviewApplication(id, true));
    }

    @PutMapping("/admin/applicants/{id}/reject")
    public ResponseEntity<SuggestionApplication> rejectApplication(@PathVariable UUID id) {
        return ResponseEntity.ok(suggestionService.reviewApplication(id, false));
    }

    @GetMapping("/admin/suggestions")
    public ResponseEntity<List<Suggestion>> getPendingSuggestions() {
        return ResponseEntity.ok(suggestionService.getPendingSuggestions());
    }

    @PutMapping("/admin/suggestions/{id}/approve")
    public ResponseEntity<Suggestion> approveSuggestion(@PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        return ResponseEntity.ok(suggestionService.reviewSuggestion(id, true,
                body != null ? body.getOrDefault("adminNote", "") : ""));
    }

    @PutMapping("/admin/suggestions/{id}/reject")
    public ResponseEntity<Suggestion> rejectSuggestion(@PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        return ResponseEntity.ok(suggestionService.reviewSuggestion(id, false,
                body != null ? body.getOrDefault("adminNote", "") : ""));
    }
}
