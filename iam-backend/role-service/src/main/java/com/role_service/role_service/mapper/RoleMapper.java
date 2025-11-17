package com.role_service.role_service.mapper;

import org.springframework.stereotype.Component;

import com.role_service.role_service.dto.RoleRequestDTO;
import com.role_service.role_service.dto.RoleResponseDTO;
import com.role_service.role_service.entity.Role;

@Component
public class RoleMapper {
    public Role toEntity(RoleRequestDTO r) {
        return Role.builder()
                .name(r.getName())
                .description(r.getDescription())
                .status(r.getStatus())
                .build();
    }

    public RoleResponseDTO toResponse(Role e) {
        return RoleResponseDTO.builder()
                .roleId(e.getRoleId())
                .name(e.getName())
                .description(e.getDescription())
                .status(e.getStatus())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public void updateEntity(Role e, RoleRequestDTO r) {
        if(r.getName() != null) e.setName(r.getName());
        if(r.getDescription() != null) e.setDescription(r.getDescription());
        if(r.getStatus() != null) e.setStatus(r.getStatus());
    }
}