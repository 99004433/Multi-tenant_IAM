package com.user_service.user_service.service;

import com.user_service.user_service.dto.PageResponse;
import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.entity.User;
import com.user_service.user_service.exception.ResourceNotFoundException;
import com.user_service.user_service.mapper.UserMapper;
import com.user_service.user_service.repository.UserRepository;
import com.user_service.user_service.util.PasswordUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import org.springframework.data.relational.core.query.Query;
import org.springframework.data.relational.core.query.Criteria;


import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private R2dbcEntityTemplate template;



    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
    
    /**
     * Create a new user.
     * - checks duplicate email
     * - maps DTO -> entity
     * - hashes password
     * - sets createdAt only (do not set updatedAt here)
     */
    @Override
    public Mono<UserResponseDto> createUser(UserRequestDto dto) {
        log.info("Attempting to create user with email={}", dto.getEmail());

        String normalizedEmail = dto.getEmail().trim().toLowerCase();

        // ensure email uniqueness
        return userRepository.existsByEmail(normalizedEmail)
                .flatMap(exists -> {
                    if (Boolean.TRUE.equals(exists)) {
                        log.warn("User creation failed: email already exists={}", dto.getEmail());
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists"));
                    }

                    // map dto to entity
                    User entity = UserMapper.toEntity(dto);

                    // determine raw password once
                    final String rawPassword =
                            (dto.getPassword() == null || dto.getPassword().isBlank())
                                    ? PasswordUtil.generateRandomPassword(12)
                                    : dto.getPassword();

                    // set createdAt only
                    entity.setCreatedAt(LocalDateTime.now());

                    log.debug("Saving new user (email={}) to repository", dto.getEmail());

                    return userRepository.save(entity)
                            .map(saved -> {
                                log.info("User created successfully: id={} email={}", saved.getUserId(), saved.getEmail());
                                return UserMapper.toResponse(saved);
                            });
                });
    }





    @Override
    public Flux<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .map(UserMapper::toResponse)
                .sort(Comparator.comparing(UserResponseDto::getUserId));
    }

    @Override
    public Mono<UserResponseDto> updateUser(Long id, UserRequestDto dto) {
        return userRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found")))
                .flatMap(existing -> {
                    UserMapper.updateEntity(existing, dto);
                    existing.setUpdatedAt(LocalDateTime.now());

                    return userRepository.save(existing);
                })
                .map(UserMapper::toResponse);
    }



    @Override
    public Mono<Void> deleteUser(Long userId) {
        return userRepository.existsById(userId)
                .flatMap(exists -> {
                    if (!exists) {
                        return Mono.error(new ResourceNotFoundException("User not found"));
                    }
                    return userRepository.deleteById(userId);
                });
    }


    @Override
    public Mono<UserResponseDto> getUserById(Long userId) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found")))
                .map(UserMapper::toResponse);
    }


    @Override
    public Flux<UserResponseDto> searchByEmail(String emailFragment) {
        String q = emailFragment == null ? "" : emailFragment.trim();
        if (q.isEmpty()) {
            return Flux.empty();
        }
        // Case-insensitive "contains" search
        return userRepository.findByEmailContainingIgnoreCase(q)
                .map(UserMapper::toResponse);
    }

    @Override
    public Mono<PageResponse<UserResponseDto>> getUsers(int page, int size, String sortBy, String sortDir) {
        if (page < 0) page = 0;
        if (size <= 0) size = 10;

        Sort.Direction direction = "asc".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        org.springframework.data.domain.Sort sort = org.springframework.data.domain.Sort.by(direction, sortBy == null ? "user_id" : sortBy);

        Query query = Query.query(Criteria.empty())
                .sort(sort)
                .limit(size)
                .offset((long) page * size);

        Flux<UserResponseDto> contentFlux = template.select(query, User.class)
                .map(UserMapper::toResponse);

        Mono<List<UserResponseDto>> contentMono = contentFlux.collectList();
        Mono<Long> countMono = template.count(Query.empty(), User.class);

        int finalSize = size;
        int finalPage = page;
        return Mono.zip(contentMono, countMono)
                .map(tuple -> {
                    List<UserResponseDto> content = tuple.getT1();
                    long total = tuple.getT2();
                    int totalPages = (int) Math.ceil((double) total / finalSize);
                    return new PageResponse<>(content, finalPage, finalSize, total, totalPages);
                });

    }


    @Override
    public Mono<PageResponse<UserResponseDto>> searchByOrganization(
            String organization, int page, int size, String sortBy, String sortDir) {

        if (organization == null) organization = "";
        if (page < 0) page = 0;
        if (size <= 0) size = 10;

        long skip = (long) page * size;

        // Fetch matching users, then sort by userId ASC (as requested)
        Flux<User> flux = userRepository.findByOrganization(organization)
                .sort(Comparator.comparing(User::getUserId,
                        Comparator.nullsLast(Comparator.naturalOrder())));

        // Optional: honor sortDir if provided
        if ("desc".equalsIgnoreCase(sortDir)) {
            flux = flux.sort(Comparator.comparing(User::getUserId,
                    Comparator.nullsLast(Comparator.naturalOrder())).reversed());
        }

        Mono<Long> totalMono = flux.count();

        Mono<List<UserResponseDto>> contentMono = flux
                .skip(skip)
                .take(size)
                .map(UserMapper::toResponse)
                .collectList();

        int finalPage = page;
        int finalSize = size;
        return Mono.zip(contentMono, totalMono)
                .map(tuple -> {
                    List<UserResponseDto> content = tuple.getT1();
                    long totalElements = tuple.getT2();
                    int totalPages = (int) ((totalElements + finalSize - 1) / finalSize);
                    return new PageResponse<>(content, finalPage, finalSize, totalElements, totalPages);
                });
    }




}
