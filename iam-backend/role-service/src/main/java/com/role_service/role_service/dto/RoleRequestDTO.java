package com.role_service.role_service.dto;

import lombok.Data;

@Data
public class RoleRequestDTO {
	private String name;
	private String description;
	private String status;
}
