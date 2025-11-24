package com.organization_service.organization_service.repository;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.organization_service.organization_service.entity.Organization;

import reactor.core.publisher.Flux;

public interface OrganizationRepository extends ReactiveCrudRepository<Organization, Long> {
	Flux<Organization> findByParentOrgId(Long parentOrgId);
}
