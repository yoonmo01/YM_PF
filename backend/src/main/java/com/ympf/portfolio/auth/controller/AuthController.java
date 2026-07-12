package com.ympf.portfolio.auth.controller;

import java.util.Arrays;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.dto.AuthResponse;
import com.ympf.portfolio.auth.dto.AuthUserResponse;
import com.ympf.portfolio.auth.dto.CsrfResponse;
import com.ympf.portfolio.auth.dto.LoginRequest;
import com.ympf.portfolio.auth.security.AuthCookieService;
import com.ympf.portfolio.auth.security.AuthenticatedUser;
import com.ympf.portfolio.auth.service.AuthService;
import com.ympf.portfolio.auth.service.AuthTokens;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final AuthCookieService cookieService;
	private final AuthProperties properties;

	public AuthController(
			AuthService authService,
			AuthCookieService cookieService,
			AuthProperties properties) {
		this.authService = authService;
		this.cookieService = cookieService;
		this.properties = properties;
	}

	@GetMapping("/csrf")
	public ResponseEntity<CsrfResponse> csrf(CsrfToken csrfToken) {
		return ResponseEntity.ok()
				.cacheControl(CacheControl.noStore())
				.body(new CsrfResponse(csrfToken.getHeaderName(), csrfToken.getToken()));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
		return authenticatedResponse(authService.login(request.email(), request.password()));
	}

	@PostMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
		return authenticatedResponse(authService.refresh(readRefreshCookie(request)));
	}

	@PostMapping("/logout")
	public ResponseEntity<Void> logout(HttpServletRequest request) {
		authService.logout(readRefreshCookie(request));
		HttpHeaders headers = noStoreHeaders();
		headers.add(HttpHeaders.SET_COOKIE, cookieService.clearAccessCookie().toString());
		headers.add(HttpHeaders.SET_COOKIE, cookieService.clearRefreshCookie().toString());
		return ResponseEntity.noContent().headers(headers).build();
	}

	@GetMapping("/me")
	public ResponseEntity<AuthUserResponse> me(@AuthenticationPrincipal AuthenticatedUser user) {
		return ResponseEntity.ok()
				.headers(noStoreHeaders())
				.body(AuthUserResponse.from(user));
	}

	private ResponseEntity<AuthResponse> authenticatedResponse(AuthTokens tokens) {
		HttpHeaders headers = noStoreHeaders();
		headers.add(HttpHeaders.SET_COOKIE, cookieService.accessCookie(tokens.accessToken()).toString());
		headers.add(HttpHeaders.SET_COOKIE, cookieService.refreshCookie(tokens.refreshToken()).toString());
		return ResponseEntity.ok().headers(headers).body(new AuthResponse(tokens.user()));
	}

	private HttpHeaders noStoreHeaders() {
		HttpHeaders headers = new HttpHeaders();
		headers.setCacheControl(CacheControl.noStore());
		return headers;
	}

	private String readRefreshCookie(HttpServletRequest request) {
		if (request.getCookies() == null) {
			return null;
		}
		return Arrays.stream(request.getCookies())
				.filter(cookie -> properties.refreshCookieName().equals(cookie.getName()))
				.map(Cookie::getValue)
				.findFirst()
				.orElse(null);
	}
}
