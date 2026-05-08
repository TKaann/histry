package com.histry.game.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.Map;

/**
 * Internal Feign client to call Content Service.
 * Bypasses the Gateway — direct service-to-service via Eureka.
 */
@FeignClient(name = "content-service", path = "/content")
public interface ContentServiceClient {

    /**
     * Fetches today's correct year for the guessing game.
     * This endpoint is internal (not exposed via Gateway to public).
     */
    @GetMapping("/today/correct-year")
    Map<String, Integer> getTodayCorrectYear();
}
