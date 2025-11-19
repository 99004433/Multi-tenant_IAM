//package com.group_service.group_service.config;
//
//import io.r2dbc.spi.ConnectionFactory;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.data.r2dbc.core.R2dbcEntityTemplate;
//
//@Configuration
//public class R2dbcConfig {
//
//    private final ConnectionFactory connectionFactory;
//
//    public R2dbcConfig(ConnectionFactory connectionFactory) {
//        this.connectionFactory = connectionFactory;
//    }
//
//    @Bean
//    public R2dbcEntityTemplate r2dbcEntityTemplate() {
//        return new R2dbcEntityTemplate(connectionFactory);
//    }
//}