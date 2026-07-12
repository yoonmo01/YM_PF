package com.ympf.portfolio.auth;

import java.time.Duration;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.common.config.WebProperties;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class AuthPropertiesTest {

	@Test
	void rejectsSameSiteNoneWithoutSecureCookies() {
		assertThrows(IllegalArgumentException.class, () -> properties(false, "None"));
	}

	@Test
	void canonicalizesSupportedSameSiteValue() {
		assertEquals("Strict", properties(true, "strict").cookieSameSite());
	}

	@Test
	void rejectsWildcardCorsOrigins() {
		assertThrows(IllegalArgumentException.class,
				() -> new WebProperties(List.of("https://*.example.com")));
	}

	@Test
	void rejectsOriginsContainingPaths() {
		assertThrows(IllegalArgumentException.class,
				() -> new WebProperties(List.of("https://example.com/admin")));
	}

	private AuthProperties properties(boolean secure, String sameSite) {
		return new AuthProperties(
				"test-secret-with-at-least-thirty-two-bytes",
				"ym-pf", "ym-pf-admin", Duration.ofMinutes(15), Duration.ofDays(7),
				"ympf_access", "ympf_refresh", "/", "/api/auth", secure, sameSite, "", "");
	}
}
