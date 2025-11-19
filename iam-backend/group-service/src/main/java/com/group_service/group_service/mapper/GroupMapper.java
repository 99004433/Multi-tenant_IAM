package com.group_service.group_service.mapper;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;

public class GroupMapper {

    public static Group toEntity(GroupRequestDto dto) {
        return Group.builder()
                .orgId(dto.getOrgId())
                .name(dto.getName())
                .description(dto.getDescription())
                .allowedRoleIds(dto.getAllowedRoleIds())
                .status("ACTIVE")
                .build();
    }

    public static GroupResponseDto toDto(Group entity) {
        return GroupResponseDto.builder()
                .groupId(entity.getGroupId())
                .orgId(entity.getOrgId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .allowedRoleIds(entity.getAllowedRoleIds())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static void updateEntity(Group entity, GroupRequestDto dto) {
        entity.setOrgId(dto.getOrgId());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity.setAllowedRoleIds(dto.getAllowedRoleIds());
        // Keep status unchanged unless explicitly updated
    }
}