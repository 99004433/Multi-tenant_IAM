package com.user_service.user_service.service;


import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.entity.User;
import com.user_service.user_service.exception.ResourceNotFoundException;
import com.user_service.user_service.mapper.UserMapper;
import com.user_service.user_service.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserRepository userRepository;
   

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();


    @Override
    public Mono<UserResponseDto> createUser(UserRequestDto userRequestDto) {
        User entity = UserMapper.toEntity(userRequestDto);
        return userRepository.save(entity)
                .map(UserMapper::toResponse);
    }


    @Override
    public Flux<UserResponseDto> getAllUsers() {
        return userRepository.findAll()
                .map(UserMapper::toResponse);
    }


    @Override
    public Mono<UserResponseDto> updateUser(Long userId, UserRequestDto userRequestDto) {
        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found")))
                .flatMap(entity -> {
                    UserMapper.updateEntity(entity, userRequestDto);
                    return userRepository.save(entity);
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
