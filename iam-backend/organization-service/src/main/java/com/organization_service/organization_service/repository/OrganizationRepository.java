package com.organization_service.organization_service.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.organization_service.organization_service.entity.Organization;

public interface OrganizationRepository extends ReactiveCrudRepository<Organization, Long> {

}
