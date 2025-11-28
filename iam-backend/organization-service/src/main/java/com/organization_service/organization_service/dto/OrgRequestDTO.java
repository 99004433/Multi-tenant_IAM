package com.organization_service.organization_service.dto;

import lombok.Builder;
import lombok.Data;

@Data
public class OrgRequestDTO {
	private String name;
	private Long parentOrgId;
	private String address;
	private String status;
	private String region;
	private String country;
	private String state;
	private String city;
	private String zipcode;
}
