package com.ympf.portfolio.auth.dto;

import java.util.UUID;

import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.security.AuthenticatedUser;

public record AuthUserResponse(UUID id, String email, String role) {

	public static AuthUserResponse from(User user) {
		return new AuthUserResponse(user.getId(), user.getEmail(), user.getRole().name());
	}

	public static AuthUserResponse from(AuthenticatedUser user) {
		return new AuthUserResponse(user.id(), user.email(), user.role().name());
	}
}
