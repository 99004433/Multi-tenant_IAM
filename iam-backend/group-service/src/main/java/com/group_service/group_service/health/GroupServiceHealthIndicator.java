
package com.group_service.group_service.health;

import com.group_service.group_service.repository.GroupRepository;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.ReactiveHealthIndicator;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@Component
public class GroupServiceHealthIndicator implements ReactiveHealthIndicator {

    private final GroupRepository groupRepository;

    public GroupServiceHealthIndicator(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @Override
    public Mono<Health> health() {
        return groupRepository.count()
                .map(count -> Health.up()
                        .withDetail("GroupCount", count)
                        .withDetail("Database", "Accessible")
                        .build())
                .onErrorResume(e -> Mono.just(Health.down()
                        .withDetail("Error", e.getMessage())
                        .build()));
    }
}
