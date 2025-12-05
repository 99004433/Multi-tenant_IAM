
package com.group_service.group_service.mapper;

import com.group_service.group_service.dto.GroupRequestDto;
import com.group_service.group_service.dto.GroupResponseDto;
import com.group_service.group_service.entity.Group;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public final class GroupMapper {

    private GroupMapper() {
        // Utility class
    }

    // Convert Request DTO to Entity (for create)
    public static Group toEntity(GroupRequestDto dto) {
        if (dto == null) return null;

        return Group.builder()
                .orgId(dto.getOrgId())
                .name(safeTrim(dto.getName()))
                .description(safeTrim(dto.getDescription()))
                .allowedRoleIds(copyList(dto.getAllowedRoleIds()))
                .status(dto.getStatus() != null ? ((String) dto.getStatus()).trim() : "ACTIVE")
                .build();
    }

    // Convert Entity to Response DTO
    public static GroupResponseDto toDto(Group entity) {
        if (entity == null) return null;

        return GroupResponseDto.builder()
                .groupId(entity.getGroupId())
                .orgId(entity.getOrgId())
                .name(entity.getName())
                .description(entity.getDescription())
                .status(entity.getStatus()) // String status
                .allowedRoleIds(copyList(entity.getAllowedRoleIds()))
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }


    public static void updateEntity(Group entity, GroupRequestDto dto) {
        if (entity == null || dto == null) return;

        if (dto.getName() != null) {
            entity.setName(safeTrim(dto.getName()));
        }
        if (dto.getDescription() != null) {
            entity.setDescription(safeTrim(dto.getDescription()));
        }
        if (dto.getAllowedRoleIds() != null) {
            entity.setAllowedRoleIds(copyList(dto.getAllowedRoleIds()));
        }
        if (dto.getStatus() != null) {
            entity.setStatus(((String) dto.getStatus()).trim());
        }

        // If your business allows changing org ownership, uncomment:
        // if (dto.getOrgId() != null) {
        //     entity.setOrgId(dto.getOrgId());
        // }
    }

    // -------- Helpers --------

    private static String safeTrim(String s) {
        return s == null ? null : s.trim();
    }

    private static <T> List<T> copyList(List<T> source) {
        return source == null ? null : List.copyOf(source);
    }
}
