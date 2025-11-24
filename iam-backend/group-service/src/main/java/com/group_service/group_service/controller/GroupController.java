package com.group_service.group_service.controller;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;
import com.group_service.group_service.exception.GroupNotFoundException;
import com.group_service.group_service.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


@CrossOrigin(origins = "http://localhost:5000")
@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public Mono<GroupResponseDto> createGroup(@RequestBody GroupRequestDto requestDto) {
        return groupService.createGroup(requestDto);
    }

    @GetMapping("getGroupById/{id}")
    public Mono<ResponseEntity<GroupResponseDto>> getGroup(@PathVariable Long id) {
        return groupService.getGroupById(id)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }

    @PutMapping("updatedGroup/{id}")
    public Mono<ResponseEntity<GroupResponseDto>> updateGroup(@PathVariable Long id,
                                                              @RequestBody GroupRequestDto requestDto) {
        return groupService.updateGroup(id, requestDto)
                .map(ResponseEntity::ok)
                .switchIfEmpty(Mono.just(ResponseEntity.notFound().build()));
    }


//    @DeleteMapping("deleteById/{id}")
//    public Mono<Void> deleteGroup(@PathVariable Long id) {
//        return groupService.deleteGroupById(id);
//    }
@DeleteMapping("deleteById/{id}")
public Mono<Void> deleteGroup(@PathVariable Long id) {
    return groupService.deleteGroupById(id)
            .onErrorResume(GroupNotFoundException.class, ex -> {
                // Re-throw or convert to a proper error signal
                return Mono.error(new GroupNotFoundException("Group with ID " + id + " not found"));
            })
            .onErrorResume(Exception.class, ex -> {
                // For any other exception
                return Mono.error(new RuntimeException("Failed to delete group: " + ex.getMessage()));
            });
}

    @GetMapping
    public Flux<Group> getAllGroups() {
        return groupService.getAllGroups();
    }


}