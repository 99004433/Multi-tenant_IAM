package com.group_service.group_service.service;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;

import java.util.List;

public interface GroupService {
    GroupResponseDto createGroup(GroupRequestDto requestDto);
    GroupResponseDto getGroupById(Long id);
    GroupResponseDto updateGroup(Long id, GroupRequestDto requestDto);
    void deleteGroup(Long id);
    List<GroupResponseDto> getAllGroups();

}