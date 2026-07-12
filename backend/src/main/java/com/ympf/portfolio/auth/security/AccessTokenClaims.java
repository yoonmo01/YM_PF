package com.ympf.portfolio.auth.security;

import java.time.Instant;
import java.util.UUID;

import com.ympf.portfolio.auth.domain.UserRole;

public record AccessTokenClaims(
		UUID subject,
		UserRole role,
		UUID tokenId,
		Instant issuedAt,
		Instant expiresAt) {
}
