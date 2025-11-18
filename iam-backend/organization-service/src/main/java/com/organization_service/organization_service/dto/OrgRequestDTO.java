package com.organization_service.organization_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
public class OrgRequestDTO {
	private String name;
	private Long parentOrgId;
	private Integer level;
	private String address;
	private String status;
	private Double latitude;
	private Double longitude;
}
