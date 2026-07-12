package com.ympf.portfolio.auth.config;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.StringUtils;

@ConfigurationProperties("app.auth")
public record AuthProperties(
		String jwtSecret,
		String issuer,
		String audience,
		Duration accessTokenTtl,
		Duration refreshTokenTtl,
		String accessCookieName,
		String refreshCookieName,
		String accessCookiePath,
		String refreshCookiePath,
		boolean cookieSecure,
		String cookieSameSite,
		String adminEmail,
		String adminPassword) {

	private static final Pattern COOKIE_NAME = Pattern.compile("[A-Za-z0-9_-]{1,64}");
	private static final Set<String> SAME_SITE_VALUES = Set.of("Lax", "Strict", "None");

	public AuthProperties {
		if (!StringUtils.hasText(jwtSecret)
				|| jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
			throw new IllegalArgumentException("JWT_SECRET must contain at least 32 UTF-8 bytes");
		}
		requireText(issuer, "JWT_ISSUER");
		requireText(audience, "JWT_AUDIENCE");
		if (accessTokenTtl == null || accessTokenTtl.isZero() || accessTokenTtl.isNegative()
				|| accessTokenTtl.compareTo(Duration.ofHours(1)) > 0) {
			throw new IllegalArgumentException("ACCESS_TOKEN_TTL must be greater than zero and at most one hour");
		}
		if (refreshTokenTtl == null || refreshTokenTtl.compareTo(accessTokenTtl) <= 0
				|| refreshTokenTtl.compareTo(Duration.ofDays(90)) > 0) {
			throw new IllegalArgumentException(
					"REFRESH_TOKEN_TTL must exceed ACCESS_TOKEN_TTL and be at most 90 days");
		}
		validateCookieName(accessCookieName, "ACCESS_COOKIE_NAME");
		validateCookieName(refreshCookieName, "REFRESH_COOKIE_NAME");
		if (accessCookieName.equals(refreshCookieName)) {
			throw new IllegalArgumentException("Access and refresh cookie names must differ");
		}
		validateCookiePath(accessCookiePath, "ACCESS_COOKIE_PATH");
		validateCookiePath(refreshCookiePath, "REFRESH_COOKIE_PATH");
		cookieSameSite = canonicalSameSite(cookieSameSite);
		if ("None".equals(cookieSameSite) && !cookieSecure) {
			throw new IllegalArgumentException("COOKIE_SECURE must be true when COOKIE_SAME_SITE is None");
		}
		adminEmail = adminEmail == null ? "" : adminEmail.strip();
		adminPassword = adminPassword == null ? "" : adminPassword;
	}

	private static void requireText(String value, String property) {
		if (!StringUtils.hasText(value)) {
			throw new IllegalArgumentException(property + " must not be blank");
		}
	}

	private static void validateCookieName(String value, String property) {
		if (value == null || !COOKIE_NAME.matcher(value).matches()) {
			throw new IllegalArgumentException(property + " contains invalid characters");
		}
	}

	private static void validateCookiePath(String value, String property) {
		if (!StringUtils.hasText(value) || !value.startsWith("/")
				|| value.indexOf(';') >= 0 || value.indexOf('\r') >= 0 || value.indexOf('\n') >= 0) {
			throw new IllegalArgumentException(property + " must be an absolute cookie path");
		}
	}

	private static String canonicalSameSite(String value) {
		requireText(value, "COOKIE_SAME_SITE");
		String canonical = value.substring(0, 1).toUpperCase(Locale.ROOT)
				+ value.substring(1).toLowerCase(Locale.ROOT);
		if (!SAME_SITE_VALUES.contains(canonical)) {
			throw new IllegalArgumentException("COOKIE_SAME_SITE must be Lax, Strict, or None");
		}
		return canonical;
	}
}
