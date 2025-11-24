package com.user_service.user_service.service;

import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.entity.User;
import com.user_service.user_service.exception.ResourceNotFoundException;
import com.user_service.user_service.mapper.UserMapper;
import com.user_service.user_service.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;


    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


//    @Override
//    public Mono<UserResponseDto> createUser(UserRequestDto userRequestDto) {
//        User entity = UserMapper.toEntity(userRequestDto);
//        return userRepository.save(entity)
//                .map(UserMapper::toResponse);
//    }
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

        // ensure email uniqueness
        return userRepository.existsByEmail(dto.getEmail())
                .flatMap(exists -> {
                    if (Boolean.TRUE.equals(exists)) {
                        log.warn("User creation failed: email already exists={}", dto.getEmail());
                        return Mono.error(new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists"));
                    }

                    // map dto to entity (mapper returns raw password)
                    User entity = UserMapper.toEntity(dto);

                    // hash password in service layer (only once)
//                    entity.setPassword(passwordEncoder.encode(entity.getPassword()));

                    // set createdAt only; do not set updatedAt here so DB default controls it
                    entity.setCreatedAt(LocalDateTime.now());

                    // default status on creation
//                    entity.setStatus("ACTIVE");

                    log.debug("Saving new user (email={}) to repository", dto.getEmail());
                    return userRepository.save(entity);
                })
                .map(saved -> {
                    log.info("User created successfully: id={} email={}", saved.getUserId(), saved.getEmail());
                    return UserMapper.toResponse(saved);
                });
    }

    // other service methods (getAll/getById/update/delete) implemented elsewhere...



    @Override
    public Flux<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .map(UserMapper::toResponse);
    }


//    @Override
//    public Mono<UserResponseDto> updateUser(Long userId, UserRequestDto userRequestDto) {
//        return userRepository.findById(userId)
//                .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found")))
//                .flatMap(entity -> {
//                    UserMapper.updateEntity(entity, userRequestDto);
//                    return userRepository.save(entity);
//                })
//                .map(UserMapper::toResponse);
//    }
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



}
