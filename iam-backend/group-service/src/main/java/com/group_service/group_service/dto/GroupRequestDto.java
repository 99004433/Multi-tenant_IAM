
package com.group_service.group_service.dto;

import lombok.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupRequestDto {

    @NotNull(message = "Organization ID is required")
    private Long orgId;

    @NotBlank(message = "Group name is required")
    @Size(max = 255, message = "Group name cannot exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    // Allowed role IDs for the group
    private List<Long> allowedRoleIds;

	public Object getStatus() {
		// TODO Auto-generated method stub
		return null;
	}
}
