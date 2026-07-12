package com.ympf.portfolio.auth;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;

import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

import org.junit.jupiter.api.Test;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.exception.InvalidAccessTokenException;
import com.ympf.portfolio.auth.security.AccessTokenClaims;
import com.ympf.portfolio.auth.security.JwtTokenService;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtTokenServiceTest {

	private static final Instant ISSUED_AT = Instant.parse("2026-07-12T00:00:00Z");
	private static final String SECRET = "jwt-unit-test-secret-with-at-least-32-bytes";
	private final ObjectMapper objectMapper = JsonMapper.builder().build();
	private final User user = User.createAdmin(
			"admin@example.com", "$2a$12$00000000000000000000000000000000000000000000000000000", ISSUED_AT);

	@Test
	void issuesAndValidatesExpectedClaims() {
		JwtTokenService service = service(properties("expected-audience"), ISSUED_AT);

		AccessTokenClaims claims = service.parseAndValidate(service.createAccessToken(user));

		assertEquals(user.getId(), claims.subject());
		assertEquals(user.getRole(), claims.role());
		assertEquals(ISSUED_AT, claims.issuedAt());
		assertEquals(ISSUED_AT.plus(Duration.ofMinutes(5)), claims.expiresAt());
	}

	@Test
	void rejectsTamperedSignature() {
		JwtTokenService service = service(properties("expected-audience"), ISSUED_AT);
		String token = service.createAccessToken(user);
		String[] parts = token.split("\\.");
		char replacement = parts[2].charAt(0) == 'A' ? 'B' : 'A';
		String tampered = parts[0] + "." + parts[1] + "." + replacement + parts[2].substring(1);

		assertThrows(InvalidAccessTokenException.class, () -> service.parseAndValidate(tampered));
	}

	@Test
	void rejectsExpiredToken() {
		AuthProperties properties = properties("expected-audience");
		String token = service(properties, ISSUED_AT).createAccessToken(user);
		JwtTokenService afterExpiry = service(properties, ISSUED_AT.plus(Duration.ofMinutes(5).plusSeconds(1)));

		assertThrows(InvalidAccessTokenException.class, () -> afterExpiry.parseAndValidate(token));
	}

	@Test
	void rejectsWrongAudienceEvenWithValidSignature() {
		String token = service(properties("issued-audience"), ISSUED_AT).createAccessToken(user);
		JwtTokenService verifier = service(properties("other-audience"), ISSUED_AT);

		assertThrows(InvalidAccessTokenException.class, () -> verifier.parseAndValidate(token));
	}

	@Test
	void rejectsWrongIssuerEvenWithValidSignature() {
		AuthProperties issuingProperties = properties("expected-audience");
		String token = service(issuingProperties, ISSUED_AT).createAccessToken(user);
		AuthProperties otherIssuer = new AuthProperties(
				SECRET,
				"another-issuer",
				issuingProperties.audience(),
				issuingProperties.accessTokenTtl(),
				issuingProperties.refreshTokenTtl(),
				issuingProperties.accessCookieName(),
				issuingProperties.refreshCookieName(),
				issuingProperties.accessCookiePath(),
				issuingProperties.refreshCookiePath(),
				issuingProperties.cookieSecure(),
				issuingProperties.cookieSameSite(),
				"",
				"");

		assertThrows(InvalidAccessTokenException.class,
				() -> service(otherIssuer, ISSUED_AT).parseAndValidate(token));
	}

	private JwtTokenService service(AuthProperties properties, Instant now) {
		return new JwtTokenService(objectMapper, properties, Clock.fixed(now, ZoneOffset.UTC));
	}

	private AuthProperties properties(String audience) {
		return new AuthProperties(
				SECRET,
				"ym-pf-test",
				audience,
				Duration.ofMinutes(5),
				Duration.ofDays(1),
				"ympf_access",
				"ympf_refresh",
				"/",
				"/api/auth",
				true,
				"Strict",
				"",
				"");
	}
}
