package com.api_gateway.api_gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ApiGatewayApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApiGatewayApplication.class, args);
		System.out.println("\n" +
                "═══════════════════════════════════════════════════════════\n" +
                "   API Gateway Started Successfully! 🛡️\n" +
                "   Gateway URL: http://localhost:8085\n" +
                "   Auth Endpoints:\n" +
                "     - POST /api/auth/register\n" +
                "     - POST /api/auth/login\n" +
                "   Protected Routes:\n" +
                "     - /api/organizations/** → Organization Service\n" +
                "     - /api/users/** → User Service\n" +
                "     - /api/groups/** → Group Service\n" +
                "     - /api/roles/** → Role Service\n" +
                "═══════════════════════════════════════════════════════════\n");
	}

}
