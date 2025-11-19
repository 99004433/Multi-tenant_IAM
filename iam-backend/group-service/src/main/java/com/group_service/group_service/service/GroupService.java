package com.group_service.group_service.service;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

public interface GroupService {
    Mono<GroupResponseDto> createGroup(GroupRequestDto group);
    Mono<GroupResponseDto> getGroupById(Long id);
    Flux<Group> getAllGroups();
    Mono<GroupResponseDto> updateGroup(Long id, GroupRequestDto requestDto);
    Mono<Void> deleteGroupById(Long id);



}