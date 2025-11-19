package com.user_service.user_service.service;

import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

public interface UserService {
    Mono<UserResponseDto> createUser(UserRequestDto userRequestDto);
    Mono<UserResponseDto> getUserById(Long userId);
    Flux<UserResponseDto> getAllUsers();
    Mono<UserResponseDto> updateUser(Long userId, UserRequestDto userRequestDto);
    Mono<Void> deleteUser(Long userId);
}
