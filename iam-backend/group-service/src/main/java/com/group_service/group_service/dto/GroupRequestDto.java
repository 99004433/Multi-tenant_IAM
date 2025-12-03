package com.group_service.group_service.dto;


import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupRequestDto {
    private Long OrgId;
    private String name;
    private String description;
    private List<Long> allowedRoleIds; // new field

}

