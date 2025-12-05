
package com.group_service.group_service.exception;

import lombok.Getter;

@Getter
public class GroupNotFoundException extends RuntimeException {

    private final String errorCode = "GROUP_NOT_FOUND";

    public GroupNotFoundException(String message) {
        super(message);
    }
}
