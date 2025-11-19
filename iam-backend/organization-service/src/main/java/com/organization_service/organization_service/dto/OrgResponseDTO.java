package com.organization_service.organization_service.dto;

import java.time.LocalDateTime;


import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrgResponseDTO {
	 private Long orgId;
	    private String name;
	    private Long parentOrgId;
	    private Integer level;
	    private String address;
	    private String status;
	    private Double latitude;
	    private Double longitude;
	    private String region;
	    private String country;
	    private String state;
	    private String city;
	    private LocalDateTime createdAt;
	    private LocalDateTime updatedAt;
}
