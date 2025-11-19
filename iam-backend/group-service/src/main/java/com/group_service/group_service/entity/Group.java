package com.group_service.group_service.entity;
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//
//import java.time.LocalDateTime;
//import java.util.List;
//
//
//@Table(name = "groups")
//@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
//public class Group {
//
//	@Id
//	@GeneratedValue(strategy = GenerationType.IDENTITY)
//	private Long groupId;
//
//	// reference to organization id only (microservice-friendly)
//	private Long orgId;
//
//	@Column(nullable = false)
//	private String name;
//
//	private String description;
//	private String status;
//
//	// allowed role ids for the group — stored as an element collection
//	@ElementCollection
//	@CollectionTable(name = "group_allowed_roles", joinColumns = @JoinColumn(name = "group_id"))
//	@Column(name = "role_id")
//	private List<Long> allowedRoleIds;
//
//	@CreationTimestamp
//	private LocalDateTime createdAt;
//	@UpdateTimestamp
//	private LocalDateTime updatedAt;
//}


import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Table("groups")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group {
	@Id
	private Long groupId;
	private Long orgId;
	private String name;
	private String description;
	private String status;
	private List<Long> allowedRoleIds;
	private LocalDateTime createdAt;
	private LocalDateTime updatedAt;
}

