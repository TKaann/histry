package com.histry.auth.controller;

import com.histry.auth.dto.AuthResponse;
import com.histry.auth.dto.LoginRequest;
import com.histry.auth.dto.RegisterRequest;
import com.histry.auth.repository.UserRepository;
import com.histry.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Returns current user profile.
     * X-User-Id header is injected by the Gateway after JWT validation — no JWT parsing here.
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID id = UUID.fromString(userId); // assigned first → satisfies @NonNull
        return userRepository.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(Map.of(
                        "userId", user.getId().toString(),
                        "username", user.getUsername(),
                        "email", user.getEmail(),
                        "role", user.getRole().name(),
                        "isSuggestionApproved", user.isSuggestionApproved()
                )))
                .orElse(ResponseEntity.notFound().build());
    }
}
