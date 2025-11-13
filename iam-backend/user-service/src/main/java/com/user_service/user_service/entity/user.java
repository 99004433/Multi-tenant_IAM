package com.user_service.user_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "user_account")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class user {
	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long userId;

	    @Column(nullable = false)
	    private Long orgId;   // from organization-service

	    private Long groupId; // from group-service
	    private Long roleId;  // from role-service

	    @Column(nullable = false, unique = true)
	    private String email;

	    private String contactNo;
	    private String firstName;
	    private String middleName;
	    private String lastName;
	    private String password;
	    private LocalDateTime lastLogin;
	    private String status = "ACTIVE";

	    @CreationTimestamp
	    private LocalDateTime createdAt;

	    @UpdateTimestamp
	    private LocalDateTime updatedAt;

}
