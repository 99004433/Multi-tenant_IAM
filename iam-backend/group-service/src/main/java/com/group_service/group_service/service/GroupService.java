
package com.group_service.group_service.service;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface GroupService {

    // Create a new group
    Mono<GroupResponseDto> createGroup(GroupRequestDto requestDto);

    // Get group by ID
    Mono<GroupResponseDto> getGroupById(Long id);

    // Get all groups (return DTOs for consistency)
    Flux<GroupResponseDto> getAllGroups();

    // Update an existing group
    Mono<GroupResponseDto> updateGroup(Long id, GroupRequestDto requestDto);

    // Delete group by ID
    Mono<Void> deleteGroupById(Long id);

    Flux<Group> getGroupsByOrg(Long orgId);
}

