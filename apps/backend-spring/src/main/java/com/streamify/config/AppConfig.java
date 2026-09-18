package com.streamify.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;

@Configuration
@EnableJpaAuditing
public class AppConfig {

    @Bean
    public OpenAPI streamifyOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Streamify API")
                        .description("Streamify Video Streaming Platform — REST API Documentation")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Anurag Basuri")
                                .url("https://github.com/Anurag-Basuri/streamify"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .name("bearerAuth")
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }
}
