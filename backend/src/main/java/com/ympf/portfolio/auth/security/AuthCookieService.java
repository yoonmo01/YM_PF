package com.ympf.portfolio.auth.security;

import java.time.Duration;

import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import com.ympf.portfolio.auth.config.AuthProperties;

@Service
public class AuthCookieService {

	private final AuthProperties properties;

	public AuthCookieService(AuthProperties properties) {
		this.properties = properties;
	}

	public ResponseCookie accessCookie(String token) {
		return cookie(properties.accessCookieName(), token, properties.accessCookiePath(),
				properties.accessTokenTtl());
	}

	public ResponseCookie refreshCookie(String token) {
		return cookie(properties.refreshCookieName(), token, properties.refreshCookiePath(),
				properties.refreshTokenTtl());
	}

	public ResponseCookie clearAccessCookie() {
		return cookie(properties.accessCookieName(), "", properties.accessCookiePath(), Duration.ZERO);
	}

	public ResponseCookie clearRefreshCookie() {
		return cookie(properties.refreshCookieName(), "", properties.refreshCookiePath(), Duration.ZERO);
	}

	private ResponseCookie cookie(String name, String value, String path, Duration maxAge) {
		return ResponseCookie.from(name, value)
				.httpOnly(true)
				.secure(properties.cookieSecure())
				.sameSite(properties.cookieSameSite())
				.path(path)
				.maxAge(maxAge)
				.build();
	}
}
