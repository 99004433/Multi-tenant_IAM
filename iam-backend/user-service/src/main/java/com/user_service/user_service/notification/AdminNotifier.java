package com.user_service.user_service.notification;


import com.user_service.user_service.dto.AdminNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class AdminNotifier {
    private final SimpMessagingTemplate messagingTemplate;

    public void send(AdminNotification notification) {



        log.info("AdminNotifier: sending {}", notification);
        messagingTemplate.convertAndSend("/topic/admin/notifications", notification);
        log.info("AdminNotifier: sent to /topic/admin/notifications");

    }
}

