package com.histry.suggestion.repository;

import com.histry.suggestion.model.SuggestionApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SuggestionApplicationRepository extends JpaRepository<SuggestionApplication, UUID> {
    Optional<SuggestionApplication> findByUserIdAndStatus(UUID userId, SuggestionApplication.Status status);
    List<SuggestionApplication> findByStatus(SuggestionApplication.Status status);
    boolean existsByUserIdAndStatus(UUID userId, SuggestionApplication.Status status);
}
