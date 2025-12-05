
package com.group_service.group_service.service;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;
import com.group_service.group_service.exception.GroupNotFoundException;
import com.group_service.group_service.mapper.GroupMapper;
import com.group_service.group_service.repository.GroupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;

    @Override
    public Mono<GroupResponseDto> createGroup(GroupRequestDto requestDto) {
        Group groupEntity = GroupMapper.toEntity(requestDto);
        groupEntity.setUpdatedAt(LocalDateTime.now());
        groupEntity.setUpdatedAt(LocalDateTime.now());

        return groupRepository.save(groupEntity)
                .map(GroupMapper::toDto)
                .onErrorResume(DataAccessException.class, ex ->
                        Mono.error(new RuntimeException("Database error occurred while creating group: " + ex.getMessage())));
    }

    @Override
    public Mono<GroupResponseDto> getGroupById(Long id) {
        return groupRepository.findById(id)
                .switchIfEmpty(Mono.error(new GroupNotFoundException("Group not found with id: " + id)))
                .map(GroupMapper::toDto);
    }

    @Override
    public Flux<GroupResponseDto> getAllGroups() {
        return groupRepository.findAll()
                .map(GroupMapper::toDto);
    }

    @Override
    public Mono<GroupResponseDto> updateGroup(Long id, GroupRequestDto requestDto) {
        return groupRepository.findById(id)
                .switchIfEmpty(Mono.error(new GroupNotFoundException("Group not found with id: " + id)))
                .flatMap(existing -> {
                    GroupMapper.updateEntity(existing, requestDto);
                    existing.setUpdatedAt(LocalDateTime.now());
                    return groupRepository.save(existing);
                })
                .map(GroupMapper::toDto)
                .onErrorResume(DataAccessException.class, ex ->
                        Mono.error(new RuntimeException("Database error occurred while updating group: " + ex.getMessage())));
    }

    @Override
    public Mono<Void> deleteGroupById(Long id) {
        return groupRepository.findById(id)
                .switchIfEmpty(Mono.error(new GroupNotFoundException("Group with ID " + id + " not found")))
                .flatMap(groupRepository::delete)
                .onErrorResume(DataAccessException.class, ex ->
                        Mono.error(new RuntimeException("Database error occurred while deleting group: " + ex.getMessage())));
    }
}
