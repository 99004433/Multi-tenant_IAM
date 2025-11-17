package com.role_service.role_service.service;

import java.util.List;

import com.role_service.role_service.dto.RoleRequestDTO;
import com.role_service.role_service.dto.RoleResponseDTO;

public interface RoleService {
	RoleResponseDTO create(RoleRequestDTO request);
	RoleResponseDTO update(Long id, RoleRequestDTO request);
	RoleResponseDTO getById(Long id);
    List<RoleResponseDTO> getAll();
    void delete(Long id);
}