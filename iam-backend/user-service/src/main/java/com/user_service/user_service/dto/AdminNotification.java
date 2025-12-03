package com.user_service.user_service.dto;


import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class AdminNotification {
    private String type;          // e.g., "USER_INACTIVATED"
    private Long userId;
    private String email;
    private String reason;        // e.g., "Last login > 5 days"
    @JsonFormat(shape = JsonFormat.Shape.STRING) // ensures ISO string
    private LocalDateTime at;     // server time of event
}

