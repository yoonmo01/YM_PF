package com.ympf.portfolio.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Clock;
import java.time.Instant;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.domain.UserRole;
import com.ympf.portfolio.auth.exception.InvalidAccessTokenException;

@Service
public class JwtTokenService {

	private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
	private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
	private static final String HEADER = encodeUtf8("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
	private static final String TOKEN_TYPE = "access";

	private final ObjectMapper objectMapper;
	private final AuthProperties properties;
	private final Clock clock;
	private final byte[] signingKey;

	public JwtTokenService(ObjectMapper objectMapper, AuthProperties properties, Clock clock) {
		this.objectMapper = objectMapper;
		this.properties = properties;
		this.clock = clock;
		this.signingKey = properties.jwtSecret().getBytes(StandardCharsets.UTF_8).clone();
	}

	public String createAccessToken(User user) {
		Instant issuedAt = clock.instant();
		Instant expiresAt = issuedAt.plus(properties.accessTokenTtl());
		Map<String, Object> claims = new LinkedHashMap<>();
		claims.put("iss", properties.issuer());
		claims.put("aud", properties.audience());
		claims.put("sub", user.getId().toString());
		claims.put("role", user.getRole().name());
		claims.put("typ", TOKEN_TYPE);
		claims.put("jti", UUID.randomUUID().toString());
		claims.put("iat", issuedAt.getEpochSecond());
		claims.put("exp", expiresAt.getEpochSecond());

		try {
			String payload = BASE64_URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));
			String unsignedToken = HEADER + "." + payload;
			return unsignedToken + "." + BASE64_URL_ENCODER.encodeToString(sign(unsignedToken));
		}
		catch (JacksonException exception) {
			throw new IllegalStateException("Could not serialize access token", exception);
		}
	}

	public AccessTokenClaims parseAndValidate(String token) {
		try {
			String[] parts = token.split("\\.", -1);
			if (parts.length != 3 || parts[0].length() > 256 || parts[1].length() > 4096) {
				throw new InvalidAccessTokenException();
			}
			byte[] suppliedSignature = BASE64_URL_DECODER.decode(parts[2]);
			byte[] expectedSignature = sign(parts[0] + "." + parts[1]);
			if (!MessageDigest.isEqual(expectedSignature, suppliedSignature)) {
				throw new InvalidAccessTokenException();
			}

			JsonNode header = objectMapper.readTree(BASE64_URL_DECODER.decode(parts[0]));
			if (!"HS256".equals(requiredText(header, "alg"))
					|| !"JWT".equals(requiredText(header, "typ"))) {
				throw new InvalidAccessTokenException();
			}
			JsonNode payload = objectMapper.readTree(BASE64_URL_DECODER.decode(parts[1]));
			if (!properties.issuer().equals(requiredText(payload, "iss"))
					|| !properties.audience().equals(requiredText(payload, "aud"))
					|| !TOKEN_TYPE.equals(requiredText(payload, "typ"))) {
				throw new InvalidAccessTokenException();
			}

			UUID subject = UUID.fromString(requiredText(payload, "sub"));
			UserRole role = UserRole.valueOf(requiredText(payload, "role"));
			UUID tokenId = UUID.fromString(requiredText(payload, "jti"));
			long issuedAtSeconds = requiredLong(payload, "iat");
			long expiresAtSeconds = requiredLong(payload, "exp");
			long nowSeconds = clock.instant().getEpochSecond();
			if (issuedAtSeconds > nowSeconds + 30 || expiresAtSeconds <= nowSeconds
					|| expiresAtSeconds <= issuedAtSeconds
					|| expiresAtSeconds - issuedAtSeconds > properties.accessTokenTtl().toSeconds() + 1) {
				throw new InvalidAccessTokenException();
			}
			return new AccessTokenClaims(
					subject, role, tokenId, Instant.ofEpochSecond(issuedAtSeconds),
					Instant.ofEpochSecond(expiresAtSeconds));
		}
		catch (InvalidAccessTokenException exception) {
			throw exception;
		}
		catch (RuntimeException exception) {
			throw new InvalidAccessTokenException(exception);
		}
	}

	private byte[] sign(String unsignedToken) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(signingKey, "HmacSHA256"));
			return mac.doFinal(unsignedToken.getBytes(StandardCharsets.US_ASCII));
		}
		catch (GeneralSecurityException exception) {
			throw new IllegalStateException("HmacSHA256 is unavailable", exception);
		}
	}

	private static String requiredText(JsonNode node, String field) {
		JsonNode value = node.get(field);
		if (value == null || !value.isTextual() || value.textValue().isBlank()) {
			throw new InvalidAccessTokenException();
		}
		return value.textValue();
	}

	private static long requiredLong(JsonNode node, String field) {
		JsonNode value = node.get(field);
		if (value == null || !value.isIntegralNumber() || !value.canConvertToLong()) {
			throw new InvalidAccessTokenException();
		}
		return value.longValue();
	}

	private static String encodeUtf8(String value) {
		return BASE64_URL_ENCODER.encodeToString(value.getBytes(StandardCharsets.UTF_8));
	}
}
