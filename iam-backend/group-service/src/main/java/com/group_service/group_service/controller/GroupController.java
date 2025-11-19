package com.group_service.group_service.controller;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.service.GroupService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
@RequiredArgsConstructor
public class GroupController {

    private final GroupService groupService;

    @PostMapping("/create")
    public ResponseEntity<GroupResponseDto> createGroup(@RequestBody GroupRequestDto requestDto) {
        GroupResponseDto created = groupService.createGroup(requestDto);
        URI location = URI.create("/groups/" + created.getGroupId());
        return ResponseEntity.created(location).body(created);
    }


    @GetMapping("/{id}")
    public ResponseEntity<GroupResponseDto> getGroup(@PathVariable Long id) {
        return ResponseEntity.ok(groupService.getGroupById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<GroupResponseDto> updateGroup(@PathVariable Long id, @Valid @RequestBody GroupRequestDto requestDto) {
        return ResponseEntity.ok(groupService.updateGroup(id, requestDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable Long id) {
        groupService.deleteGroup(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<GroupResponseDto>> getAllGroups() {
        return ResponseEntity.ok(groupService.getAllGroups());
    }

}