package com.eureka.eureka_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EurekaServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaServiceApplication.class, args);
		System.out.println("\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "   Eureka Server Started Successfully! 🚀\n" +
                "   Dashboard: http://localhost:8761\n" +
                "   Services will register here automatically\n" +
                "═══════════════════════════════════════════════════════════\n");
	}

}
