package com.ympf.portfolio.auth.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.stereotype.Service;

@Service
public class RefreshTokenService {

	private static final int TOKEN_BYTES = 32;

	private final SecureRandom secureRandom;

	public RefreshTokenService(SecureRandom secureRandom) {
		this.secureRandom = secureRandom;
	}

	public GeneratedRefreshToken generate() {
		byte[] tokenBytes = new byte[TOKEN_BYTES];
		secureRandom.nextBytes(tokenBytes);
		String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(tokenBytes);
		return new GeneratedRefreshToken(rawToken, hash(rawToken));
	}

	public String hash(String rawToken) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
		}
		catch (NoSuchAlgorithmException exception) {
			throw new IllegalStateException("SHA-256 is unavailable", exception);
		}
	}

	public record GeneratedRefreshToken(String rawToken, String tokenHash) {
	}
}
