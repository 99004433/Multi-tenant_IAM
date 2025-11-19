package com.user_service.user_service.entity;
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
	private Long orgId;
	private Long groupId;
	private Long roleId;
	private String role;
	private String email;
	private String contactNo;
	private String firstName;
	private String middleName;
	private String lastName;
	private String password;
	private LocalDateTime lastLogin;
	private String status;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}