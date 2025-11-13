package com.group_service.group_service.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
@Table(name = "group_table")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class group {

	 @Id
	    @GeneratedValue(strategy = GenerationType.IDENTITY)
	    private Long groupId;

	    @Column(nullable = false)
	    private Long orgId; //Reference to Organization (no entity mapping)

	    @Column(nullable = false)
	    private String name;

	    private String description;
	    private String status = "ACTIVE";

	    @CreationTimestamp
	    private LocalDateTime createdAt;

	    @UpdateTimestamp
	    private LocalDateTime updatedAt;

   
}
