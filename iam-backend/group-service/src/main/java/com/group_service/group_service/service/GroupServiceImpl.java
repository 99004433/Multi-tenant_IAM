package com.group_service.group_service.service;

import java.time.LocalDateTime;

import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;
import com.group_service.group_service.exception.GroupNotFoundException;
import com.group_service.group_service.mapper.GroupMapper;
import com.group_service.group_service.repository.GroupRepository;

import lombok.RequiredArgsConstructor;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;

    @Override
    public Mono<GroupResponseDto> createGroup(GroupRequestDto requestDto) {
        // Convert DTO to entity
        Group groupEntity = GroupMapper.toEntity(requestDto);

        // Save entity and map back to response DTO
        return groupRepository.save(groupEntity)
                .map(GroupMapper::toDto);

    }

    @Override
    public Mono<GroupResponseDto> getGroupById(Long id) {
        return groupRepository.findById(id)
                .switchIfEmpty(Mono.error(new GroupNotFoundException("Group not found with id: " + id)))
                .map(GroupMapper::toDto);
    }

    @Override
    public Flux<GroupResponseDto> getAllGroups() {
        return groupRepository.findAll() .map(GroupMapper::toDto);
    }


    @Override
    public Mono<GroupResponseDto> updateGroup(Long id, GroupRequestDto requestDto) {
        return groupRepository.findById(id)
                .switchIfEmpty(Mono.error(new GroupNotFoundException("Group not found with id: " + id)))
                .flatMap(existing -> {
                    // Update entity using mapper
                    GroupMapper.updateEntity(existing, requestDto);
                    existing.setUpdatedAt(LocalDateTime.now());
                    return groupRepository.save(existing);
                })
                .map(GroupMapper::toDto);
    }


    @Override
    public Mono<Void> deleteGroupById(Long id) {
        return groupRepository.findById(id)
                .switchIfEmpty(Mono.error(new GroupNotFoundException("Group with ID " + id + " not found")))
                .flatMap(group -> groupRepository.deleteById(id))
                .onErrorResume(DataAccessException.class, ex -> {
                    return Mono.error(new RuntimeException("Database error occurred while deleting group: " + ex.getMessage()));
                });
    }
    @Override
    public Flux<Group> getGroupsByOrg(Long orgId) {
        return groupRepository.findByOrgId(orgId);
    }


}