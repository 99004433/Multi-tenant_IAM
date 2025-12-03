package com.user_service.user_service.controller;

import com.user_service.user_service.dto.PageResponse;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.service.UserService;

import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Slf4j
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
    public Flux<UserResponseDto> getAllUser() {
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


    /**
     * GET /api/users/searchByEmail?q=<text>
     * Search users by email (case-insensitive, contains).
     */
    @GetMapping("/searchByEmail")
    public Flux<UserResponseDto> searchByEmail(@RequestParam("q") @NotBlank String q) {
        String query = q.trim();
        log.info("Searching users by email: q='{}'", query);
        if (query.isEmpty()) {
            // Return empty Flux when query is blank to avoid scanning the whole table.
            return Flux.empty();
        }
        return userService.searchByEmail(query);
    }

    @GetMapping
    public Mono<PageResponse<UserResponseDto>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "userId") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        // map sortBy from DTO property to DB column if needed (e.g. userId -> user_id)
        String dbSortBy = mapSortBy(sortBy);
        return userService.getUsers(page, size, dbSortBy, sortDir);
    }

    private String mapSortBy(String sortBy) {
        // simple example mapping; change according to your DB column names
        return switch (sortBy) {
            case "userId" -> "user_id";
            case "firstName" -> "first_name";
            case "createdAt" -> "created_at";
            default -> sortBy; // assume it's a valid column name
        };
    }

    /**
     * Search users by organization name (partial, case-insensitive)
     * Example: GET /api/users/searchByOrganization?organization=apollo&page=0&size=10
     */
    @GetMapping("/searchByOrganization")
    public Mono<PageResponse<UserResponseDto>> searchByOrganization(
            @RequestParam("organization") String organization,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "10") int size,
            @RequestParam(name = "sortBy", defaultValue = "userId") String sortBy,
            @RequestParam(name = "sortDir", defaultValue = "asc") String sortDir

    ) {
        return userService.searchByOrganization(organization, page, size, sortBy, sortDir);
    }


}