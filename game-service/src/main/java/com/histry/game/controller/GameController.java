package com.histry.game.controller;

import com.histry.game.dto.GuessRequest;
import com.histry.game.dto.GuessResponse;
import com.histry.game.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/game")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    /**
     * Public endpoint. Client sends guessedYear + its local attempt count.
     * Server evaluates direction, never returns correct year until game over.
     */
    @PostMapping("/guess")
    public ResponseEntity<GuessResponse> guess(
            @Valid @RequestBody GuessRequest request,
            @RequestParam(defaultValue = "1") int attempt) {

        return ResponseEntity.ok(gameService.evaluate(request.getGuessedYear(), attempt));
    }
}
