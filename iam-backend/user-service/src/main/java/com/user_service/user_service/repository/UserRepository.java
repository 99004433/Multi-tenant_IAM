package com.user_service.user_service.repository;

import com.user_service.user_service.entity.User;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.data.domain.Pageable;


public interface UserRepository extends ReactiveCrudRepository<User, Long> {
    Mono<User> findByEmail(String email);
    Mono<Boolean> existsByEmail(String email);
    Flux<User> findAllBy(Pageable pageable);
    Mono<Long> count();

    // Case-insensitive "contains"
    Flux<User> findByEmailContainingIgnoreCase(String emailFragment);

    // Postgres (ILIKE) — best for Postgres
//    @Query("SELECT * FROM users WHERE organization ILIKE '%' || :organization || '%'")
//    Flux<User> findByOrganizationContainingIgnoreCase(String organization);

    @Query("SELECT * FROM user_account WHERE LOWER(organization) = LOWER($1)")
    Flux<User> findByOrganization(String organization);


}