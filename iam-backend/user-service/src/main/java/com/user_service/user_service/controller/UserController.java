package com.user_service.user_service.controller;

import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;


    @PostMapping("/save")
    public Mono<ResponseEntity<UserResponseDto>> create(@Valid @RequestBody UserRequestDto req) {
        return userService.createUser(req)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<UserResponseDto>> getById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok);
    }

    @GetMapping
    public Flux<UserResponseDto> getAll() {
        return userService.getAllUsers();
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<UserResponseDto>> update(@PathVariable Long id, @Valid @RequestBody UserRequestDto req) {
        return userService.updateUser(id, req)
                .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable Long id) {
        return userService.deleteUser(id)
                .thenReturn(ResponseEntity.noContent().build());
    }

}