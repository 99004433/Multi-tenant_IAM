package com.user_service.user_service.controller;

import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.service.UserService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
@CrossOrigin(origins = "http://localhost:5000")
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * POST /api/users
     * Create a new user.
     */
    @PostMapping("/save")
    public Mono<ResponseEntity<UserResponseDto>> createUser(@Valid @RequestBody UserRequestDto req) {
        log.info("Received request to create user: email={}", req.getEmail());

        return userService.createUser(req)
                .map(created -> {
                    log.debug("Returning CREATED response for user email={}", req.getEmail());
                    return ResponseEntity.status(HttpStatus.CREATED).body(created);
                });
    }

    @GetMapping("/getUserById/{id}")
    public Mono<ResponseEntity<UserResponseDto>> getById(@PathVariable Long id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok);
    }

    @GetMapping("getAllUsers")
    public Flux<UserResponseDto> getAll() {
        return userService.getAllUsers();
    }


    @PutMapping("/updateUser/{id}")
    public Mono<ResponseEntity<UserResponseDto>> update(
            @PathVariable("id") Long id,
            @Valid @RequestBody UserRequestDto req) {
        log.debug("Update user id={} body={}", id, req);
        return userService.updateUser(id, req)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/deleteById/{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable Long id) {
        return userService.deleteUser(id)
                .thenReturn(ResponseEntity.noContent().build());
    }

}