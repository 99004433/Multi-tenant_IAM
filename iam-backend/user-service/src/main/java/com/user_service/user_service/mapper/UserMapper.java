package com.user_service.user_service.mapper;


import com.user_service.user_service.dto.UserRequestDto;
import com.user_service.user_service.dto.UserResponseDto;
import com.user_service.user_service.entity.User;
import com.user_service.user_service.enums.UserStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class UserMapper {

    private static final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public static User toEntity(UserRequestDto dto) {
        return User.builder()
                .firstName(dto.getFirstName())
                .middleName(dto.getMiddleName())
                .lastName(dto.getLastName())
                .email(dto.getEmail())
                .organization(dto.getOrganization())
                .groupName(dto.getGroupName())
                .role(dto.getRole())
                .contactNo(dto.getContactNo())
                .password(passwordEncoder.encode(dto.getPassword()))
                .status(UserStatus.ACTIVE)
                .build();
    }

    public static void updateEntity(User entity, UserRequestDto dto) {
        if (dto.getFirstName() != null) entity.setFirstName(dto.getFirstName());
        if (dto.getMiddleName() != null) entity.setMiddleName(dto.getMiddleName());
        if (dto.getLastName() != null) entity.setLastName(dto.getLastName());
        if (dto.getEmail() != null) entity.setEmail(dto.getEmail());
        if (dto.getOrganization() != null) entity.setOrganization(dto.getOrganization());
        if (dto.getGroupName() != null) entity.setGroupName(dto.getGroupName());
        if (dto.getRole() != null) entity.setRole(dto.getRole());
        if (dto.getContactNo() != null) entity.setContactNo(dto.getContactNo());
        if (dto.getStatus() != null) entity.setStatus(dto.getStatus());
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
                .organization(entity.getOrganization())
                .groupName(entity.getGroupName())
                .role(entity.getRole())
                .password(passwordEncoder.encode(entity.getPassword()))
                .contactNo(entity.getContactNo())
                .lastLogin(entity.getLastLogin())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}