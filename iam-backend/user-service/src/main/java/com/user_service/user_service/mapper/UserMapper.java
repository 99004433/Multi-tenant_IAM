package com.user_service.user_service.mapper;


import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.entity.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserMapper {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static User toEntity(UserRequestDto dto) {
        return User.builder()
                .firstName(dto.getFirstName())
                .middleName(dto.getMiddleName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .orgId(dto.getOrgId())
                .groupId(dto.getGroupId())
                .roleId(dto.getRoleId())
                .role(dto.getRole())
                .contactNo(dto.getContactNo())
                .password(passwordEncoder.encode(dto.getPassword()))
                .status("ACTIVE")
                .build();
    }

    public static void updateEntity(User entity, UserRequestDto dto) {
        entity.setFirstName(dto.getFirstName());
        entity.setMiddleName(dto.getMiddleName());
        entity.setLastName(dto.getLastName());
        entity.setEmail(dto.getEmail());
        entity.setOrgId(dto.getOrgId());
        entity.setGroupId(dto.getGroupId());
        entity.setRoleId(dto.getRoleId());
        entity.setRole(dto.getRole());
        entity.setContactNo(dto.getContactNo());

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            entity.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
    }

    public static UserResponseDto toResponse(User entity) {
        return UserResponseDto.builder()
                .userId(entity.getUserId())
                .firstName(entity.getFirstName())
                .middleName(entity.getMiddleName())
                .lastName(entity.getLastName())
                .email(entity.getEmail())
                .orgId(entity.getOrgId())
                .groupId(entity.getGroupId())
                .roleId(entity.getRoleId())
                .role(entity.getRole())
                .contactNo(entity.getContactNo())
                .lastLogin(entity.getLastLogin())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}