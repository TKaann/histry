package com.histry.auth.kafka;

import com.histry.auth.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private static final String TOPIC = "user-registered";
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public void publishUserRegistered(User user) {
        Map<String, String> event = Map.of(
                "userId", user.getId().toString(),
                "username", user.getUsername(),
                "email", user.getEmail()
        );
        kafkaTemplate.send(TOPIC, user.getId().toString(), event)
                .whenComplete((result, ex) -> {
                    if (ex != null) {
                        log.error("Failed to publish user-registered event for {}", user.getId(), ex);
                    } else {
                        log.info("Published user-registered event for {}", user.getId());
                    }
                });
    }
}
