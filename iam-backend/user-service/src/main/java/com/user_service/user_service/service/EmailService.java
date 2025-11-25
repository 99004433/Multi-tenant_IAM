package com.user_service.user_service.service;

import reactor.core.publisher.Mono;

public interface EmailService {
    Mono<Void> sendUserCreatedEmail(String toEmail, String username, String plainPassword);
}