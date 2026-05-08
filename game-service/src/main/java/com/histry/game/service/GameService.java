package com.histry.game.service;

import com.histry.game.client.ContentServiceClient;
import com.histry.game.dto.GuessResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Stateless guess evaluator.
 *
 * - No database. No user tracking. All state lives in browser localStorage.
 * - Server only validates the guessed year vs correct year.
 * - Correct year is cached daily (fetched once per day from Content Service).
 * - The server never tells the client the correct year until game is over.
 *
 * Why server-side at all? To prevent client from reading the answer
 * from Network tab (if we compared locally, the correct year would
 * have to travel to the browser before the game ends).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GameService {

    private static final int MAX_ATTEMPTS = 6;

    private final ContentServiceClient contentServiceClient;

    // Key: date string ("2026-05-07"), Value: correct year
    private final ConcurrentHashMap<String, Integer> dailyYearCache = new ConcurrentHashMap<>();

    /**
     * Evaluates a guessed year against today's correct year.
     * The attempt number is sent by the client (trusted for direction only — client manages its own state).
     */
    public GuessResponse evaluate(int guessedYear, int attemptNumber) {
        int correctYear = getTodayCorrectYear();

        GuessResponse.Direction direction;
        if (guessedYear < correctYear) {
            direction = GuessResponse.Direction.HIGHER;
        } else if (guessedYear > correctYear) {
            direction = GuessResponse.Direction.LOWER;
        } else {
            direction = GuessResponse.Direction.CORRECT;
        }

        boolean won = direction == GuessResponse.Direction.CORRECT;
        boolean gameOver = won || attemptNumber >= MAX_ATTEMPTS;

        return GuessResponse.builder()
                .direction(direction)
                .attempt(attemptNumber)
                .gameOver(gameOver)
                .won(won)
                .correctYear(gameOver ? correctYear : null) // reveal only on game over
                .build();
    }

    private int getTodayCorrectYear() {
        String today = LocalDate.now().toString();
        return dailyYearCache.computeIfAbsent(today, date -> {
            log.info("Cache miss for {}. Fetching from Content Service.", date);
            try {
                return contentServiceClient.getTodayCorrectYear().get("correctYear");
            } catch (Exception e) {
                log.error("Failed to fetch correct year from Content Service", e);
                throw new RuntimeException("Could not retrieve today's event year", e);
            }
        });
    }

    /**
     * Evict yesterday's cache entry at midnight to prevent stale data.
     */
    @Scheduled(cron = "0 1 0 * * *") // 00:01 every day
    public void evictStaleCache() {
        String yesterday = LocalDate.now().minusDays(1).toString();
        dailyYearCache.remove(yesterday);
        log.info("Evicted stale year cache for {}", yesterday);
    }
}
