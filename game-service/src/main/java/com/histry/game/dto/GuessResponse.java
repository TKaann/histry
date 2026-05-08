package com.histry.game.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GuessResponse {

    public enum Direction {
        HIGHER, LOWER, CORRECT
    }

    private Direction direction;
    private int attempt;         // Which attempt number this was (1-6)
    private boolean gameOver;    // True if correct or max attempts reached
    private boolean won;
    private Integer correctYear; // Only revealed when gameOver = true
}
