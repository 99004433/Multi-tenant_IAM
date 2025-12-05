
package com.group_service.group_service.repository;

import com.group_service.group_service.entity.Group;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;

public interface GroupRepository extends ReactiveCrudRepository<Group, Long> {

    // ✅ Custom query methods for better flexibility
    Flux<Group> findByOrgId(Long orgId);

    Flux<Group> findByStatus(String status);
}
