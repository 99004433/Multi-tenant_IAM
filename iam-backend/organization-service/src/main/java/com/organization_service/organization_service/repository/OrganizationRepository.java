package com.organization_service.organization_service.repository;

import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;

import com.organization_service.organization_service.entity.Organization;

import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface OrganizationRepository extends ReactiveCrudRepository<Organization, Long> {
	Flux<Organization> findAllByParentOrgId(Long parentOrgId);

	@Query("SELECT * FROM organization WHERE parent_org_id IS NULL ORDER BY org_id LIMIT :size OFFSET :offset")
	Flux<Organization> findAllPaginated(long offset, int size);

	@Query("SELECT COUNT(*) FROM organization WHERE parent_org_id IS NULL")
	Mono<Long> countAllOrganizations();
}
