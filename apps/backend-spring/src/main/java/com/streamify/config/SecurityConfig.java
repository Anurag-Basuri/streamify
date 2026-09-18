package com.streamify.config;

import com.streamify.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .headers(headers -> headers
                        .frameOptions(frame -> frame.deny())
                        .contentSecurityPolicy(csp -> csp.policyDirectives("default-src 'self'"))
                )
                .authorizeHttpRequests(auth -> auth
                        // Health & docs
                        .requestMatchers("/health", "/status", "/swagger-ui/**", "/v3/api-docs/**",
                                "/swagger-ui.html", "/favicon.ico").permitAll()

                        // Public auth endpoints
                        .requestMatchers(
                                "/api/v1/users/login",
                                "/api/v1/users/register",
                                "/api/v1/users/refresh-token",
                                "/api/v1/users/forgot-password",
                                "/api/v1/users/reset-password/**",
                                "/api/v1/users/verify-email/**",
                                "/api/v1/users/auth/google",
                                "/api/v1/users/auth/google/client-id"
                        ).permitAll()

                        // Public channel profile
                        .requestMatchers(HttpMethod.GET, "/api/v1/users/c/**").permitAll()

                        // Public video endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/videos").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/videos/recommendations/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/videos/{videoId}").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/videos/{videoId}/views").permitAll()

                        // Public comment endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/comments/**").permitAll()

                        // Public tweet feed
                        .requestMatchers(HttpMethod.GET, "/api/v1/tweets").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/tweets/{userId}").permitAll()

                        // Public playlist view
                        .requestMatchers(HttpMethod.GET, "/api/v1/playlists/{playlistId}").permitAll()

                        // Public follow/subscription views
                        .requestMatchers(HttpMethod.GET, "/api/v1/follows/{userId}/followers").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/follows/{userId}/following").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/subscriptions/{channelId}/subscribers").permitAll()

                        // WebSocket
                        .requestMatchers("/ws/**").permitAll()

                        // Everything else requires authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
