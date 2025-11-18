package com.organization_service.organization_service.service;

import java.util.List;

import com.organization_service.organization_service.dto.OrgRequestDTO;
import com.organization_service.organization_service.dto.OrgResponseDTO;

public interface OrganizationService {

	OrgResponseDTO create(OrgRequestDTO request);

	OrgResponseDTO update(Long orgId, OrgRequestDTO request);

	OrgResponseDTO getById(Long orgId);

	List<OrgResponseDTO> getAll();

	void delete(Long orgId);

}
