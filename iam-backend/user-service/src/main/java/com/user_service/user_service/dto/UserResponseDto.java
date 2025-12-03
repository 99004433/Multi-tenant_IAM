package com.user_service.user_service.dto;


import com.user_service.user_service.enums.UserStatus;
import lombok.Builder;
import lombok.Data;


import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDto {
    private Long userId;
    private String firstName;
    private String middleName;
    private String lastName;
    private String email;

    private String organization;   // from organization-service

    private String groupName; // from group-service
    private String role;
    private String contactNo;
    private LocalDateTime lastLogin;
    private UserStatus status;
    private String password;

    private LocalDateTime createdAt;


    private LocalDateTime updatedAt;
}
