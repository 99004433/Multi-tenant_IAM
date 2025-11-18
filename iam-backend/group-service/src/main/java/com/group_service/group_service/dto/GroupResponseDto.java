package com.group_service.group_service.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupResponseDto {
    private Long groupId;
    private Long orgId;
    private String name;
    private String description;
    private String status;
    private List<Long> allowedRoleIds; // new field
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}