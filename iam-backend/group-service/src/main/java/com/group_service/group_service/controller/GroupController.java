
package com.group_service.group_service.controller;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.exception.GroupNotFoundException;
import com.group_service.group_service.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    /**
     * Create a new group.
     * Returns 201 Created with Location header and body containing the created resource.
     */

@PostMapping
public Mono<ResponseEntity<GroupResponseDto>> createGroup(@Valid @RequestBody GroupRequestDto requestDto) {
    return groupService.createGroup(requestDto)
            .map(created -> ResponseEntity
                .created(URI.create("/api/groups/" + created.getGroupId()))
                .body(created))
            .onErrorResume(ex -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()));
}


    /**
     * Get a group by ID.
     * Returns 200 OK with body or 404 Not Found when absent.
     */
    @GetMapping("/{id}")
    public Mono<ResponseEntity<GroupResponseDto>> getGroup(@PathVariable Long id) {
        return groupService.getGroupById(id)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Update an existing group (full update / PUT).
     * Returns 200 OK with updated resource or 404 if not found.
     */
    @PutMapping("/{id}")
    public Mono<ResponseEntity<GroupResponseDto>> updateGroup(
            @PathVariable Long id,
            @Valid @RequestBody GroupRequestDto requestDto) {
        return groupService.updateGroup(id, requestDto)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Delete a group by ID.
     * Returns 204 No Content on success, 404 Not Found if it doesn't exist.
     */
    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Object>> deleteGroup(@PathVariable Long id) {
        return groupService.deleteGroupById(id)
                .then(Mono.just(ResponseEntity.noContent().build()))
                .onErrorResume(GroupNotFoundException.class,
                        ex -> Mono.just(ResponseEntity.notFound().build()))
                .onErrorResume(ex -> Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()));
    }

    /**
     * Get all groups.
     * Streams DTOs reactively.
     */
    @GetMapping
    public Flux<GroupResponseDto> getAllGroups() {
        return groupService.getAllGroups();
    }
}
