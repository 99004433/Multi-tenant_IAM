package com.user_service.user_service.entity;
import com.user_service.user_service.enums.UserStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;

import java.time.LocalDateTime;

@Table("user_account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {
	@Id
	private Long userId;
	private String organization;
	private String groupName;
	private String role;
	private String email;
	private String contactNo;
	private String firstName;
	private String middleName;
	private String lastName;
	private String password;
	private LocalDateTime lastLogin;
	private UserStatus status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}