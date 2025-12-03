
package com.user_service.user_service.jobs;

import com.user_service.user_service.dto.AdminNotification;
import com.user_service.user_service.entity.User;
import com.user_service.user_service.enums.UserStatus;
import com.user_service.user_service.notification.AdminNotifier;
import com.user_service.user_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class InactiveUserScheduler {

    private final UserRepository userRepository;
    private final AdminNotifier adminNotifier;

    /**
     * Runs every hour. Adjust as needed: "0 0 * * * *" for hourly at minute 0.
     * Cron format: second minute hour day month dayOfWeek
     */

    @Scheduled(cron = "0 * * * * *") // every minute for testing
    public void markInactiveAndNotify() {
        log.info("InactiveUserScheduler started");

        userRepository.findUsersInactiveByLoginThreshold()
                .flatMap(user ->
                        userRepository.markInactiveIfActive(user.getUserId())
                                .map(updatedUserId -> new Object[]{user, updatedUserId})
                )
                .flatMap(result -> {
                    User user = (User) result[0];
                    Long updatedId = (Long) result[1];
                    log.info("Scheduler update result: userId={}, updatedId={}", user.getUserId(), updatedId);

                    if (updatedId != null) {
                        AdminNotification n = AdminNotification.builder()
                                .type("USER_INACTIVATED")
                                .userId(user.getUserId())
                                .email(user.getEmail())
                                .reason("Last login > 5 days")
                                .at(LocalDateTime.now())
                                .build();
                        adminNotifier.send(n);
                        log.info("User {} marked INACTIVE and notified", user.getEmail());
                    } else {
                        log.warn("User {} update returned null updatedId; notification skipped", user.getEmail());
                    }
                    return Mono.empty();
                })
                .doOnError(e -> log.error("Error in InactiveUserScheduler", e))
                .subscribe();
    }

}
