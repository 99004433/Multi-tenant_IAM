package com.group_service.group_service.service;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;
import com.group_service.group_service.mapper.GroupMapper;
import com.group_service.group_service.repository.GroupRepository;
import com.group_service.group_service.service.GroupService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;

    @Override
    public GroupResponseDto createGroup(GroupRequestDto requestDto) {
        Group entity = GroupMapper.toEntity(requestDto);
        entity = groupRepository.save(entity);
        return GroupMapper.toDto(entity);
    }

    @Override
    public GroupResponseDto getGroupById(Long id) {
        Group entity = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        return GroupMapper.toDto(entity);
    }

    @Override
    public GroupResponseDto updateGroup(Long id, GroupRequestDto requestDto) {
        Group entity = groupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Group not found"));
        GroupMapper.updateEntity(entity, requestDto);
        entity = groupRepository.save(entity);
        return GroupMapper.toDto(entity);
    }

    @Override
    public void deleteGroup(Long id) {
        if (!groupRepository.existsById(id)) {
            throw new RuntimeException("Group not found");
        }
        groupRepository.deleteById(id);
    }

    @Override
    public List<GroupResponseDto> getAllGroups() {
        return groupRepository.findAll()
                .stream()
                .map(GroupMapper::toDto)
                .toList();
    }
}