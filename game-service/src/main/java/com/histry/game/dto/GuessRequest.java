package com.histry.game.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GuessRequest {

    @NotNull(message = "guessedYear is required")
    @Min(value = -9999, message = "Year must be after -9999")
    @Max(value = 2100, message = "Year seems too far in the future")
    private Integer guessedYear;
}
