package com.ympf.portfolio.common.config;

import java.security.SecureRandom;
import java.time.Clock;
import java.util.List;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.repository.UserRepository;
import com.ympf.portfolio.auth.security.JwtAuthenticationFilter;
import com.ympf.portfolio.auth.security.JwtTokenService;
import com.ympf.portfolio.common.security.ApiAccessDeniedHandler;
import com.ympf.portfolio.common.security.ApiAuthenticationEntryPoint;

@Configuration(proxyBeanMethods = false)
@EnableConfigurationProperties({AuthProperties.class, WebProperties.class})
public class SecurityConfig {

	@Bean
	Clock clock() {
		return Clock.systemUTC();
	}

	@Bean
	SecureRandom secureRandom() {
		return new SecureRandom();
	}

	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(12);
	}

	@Bean
	JwtAuthenticationFilter jwtAuthenticationFilter(
			JwtTokenService jwtTokenService,
			UserRepository userRepository,
			AuthProperties properties) {
		return new JwtAuthenticationFilter(jwtTokenService, userRepository, properties);
	}

	@Bean
	CookieCsrfTokenRepository csrfTokenRepository(AuthProperties properties) {
		CookieCsrfTokenRepository repository = CookieCsrfTokenRepository.withHttpOnlyFalse();
		repository.setCookieCustomizer(cookie -> cookie
				.path("/")
				.secure(properties.cookieSecure())
				.sameSite(properties.cookieSameSite()));
		return repository;
	}

	@Bean
	CorsConfigurationSource corsConfigurationSource(WebProperties properties) {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOrigins(properties.allowedOrigins());
		configuration.setAllowCredentials(true);
		configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(List.of(
				HttpHeaders.ACCEPT, HttpHeaders.CONTENT_TYPE, HttpHeaders.CACHE_CONTROL, "X-XSRF-TOKEN"));
		configuration.setMaxAge(3600L);

		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			JwtAuthenticationFilter jwtAuthenticationFilter,
			CookieCsrfTokenRepository csrfTokenRepository,
			ApiAuthenticationEntryPoint authenticationEntryPoint,
			ApiAccessDeniedHandler accessDeniedHandler) throws Exception {
		CsrfTokenRequestAttributeHandler csrfRequestHandler = new CsrfTokenRequestAttributeHandler();
		http
				.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.requestCache(cache -> cache.disable())
				.cors(Customizer.withDefaults())
				.csrf(csrf -> csrf
						.csrfTokenRepository(csrfTokenRepository)
						.csrfTokenRequestHandler(csrfRequestHandler))
				.httpBasic(httpBasic -> httpBasic.disable())
				.formLogin(formLogin -> formLogin.disable())
				.logout(logout -> logout.disable())
				.exceptionHandling(exceptions -> exceptions
						.authenticationEntryPoint(authenticationEntryPoint)
						.accessDeniedHandler(accessDeniedHandler))
				.authorizeHttpRequests(authorize -> authorize
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers(
								"/actuator/health", "/actuator/health/**",
								"/v3/api-docs/**", "/swagger-ui.html", "/swagger-ui/**",
								"/api/auth/csrf", "/api/auth/login", "/api/auth/refresh", "/api/auth/logout")
						.permitAll()
						.requestMatchers(HttpMethod.GET, "/api/public/**").permitAll()
						.requestMatchers("/api/admin/**").hasRole("ADMIN")
						.requestMatchers("/api/auth/me").authenticated()
						.anyRequest().denyAll())
				.addFilterBefore(jwtAuthenticationFilter, AnonymousAuthenticationFilter.class);
		return http.build();
	}
}
