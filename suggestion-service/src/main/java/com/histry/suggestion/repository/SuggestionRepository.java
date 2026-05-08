package com.histry.suggestion.repository;

import com.histry.suggestion.model.Suggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface SuggestionRepository extends JpaRepository<Suggestion, UUID> {
    List<Suggestion> findByUserId(UUID userId);
    List<Suggestion> findByStatus(Suggestion.Status status);
}
