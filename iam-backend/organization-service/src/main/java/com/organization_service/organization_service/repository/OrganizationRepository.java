package com.organization_service.organization_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.organization_service.organization_service.entity.Organization;

public interface OrganizationRepository extends JpaRepository<Organization, Long>{

}
