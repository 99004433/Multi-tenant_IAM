package com.user_service.user_service.dto;

import jakarta.persistence.Column;
import lombok.Builder;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDto {
    private Long userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;

    private Long orgId;   // from organization-service

    private Long groupId; // from group-service
    private Long roleId;  // from role-service
    private String contactNo;
    private LocalDateTime lastLogin;
    private String status = "ACTIVE";


    private LocalDateTime createdAt;


    private LocalDateTime updatedAt;
}
