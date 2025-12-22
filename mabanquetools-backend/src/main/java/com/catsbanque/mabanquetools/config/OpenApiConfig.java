package com.catsbanque.mabanquetools.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Ma Banque Tools API")
                        .version("1.0")
                        .description("Documentation de l'API pour l'application Ma Banque Tools. " +
                                "Permet la gestion des événements, des absences et des processus internes."));
    }
}
