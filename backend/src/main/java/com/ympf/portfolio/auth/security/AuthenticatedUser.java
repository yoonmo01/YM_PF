package com.ympf.portfolio.auth.security;

import java.util.UUID;

import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.domain.UserRole;

public record AuthenticatedUser(UUID id, String email, UserRole role) {

	public static AuthenticatedUser from(User user) {
		return new AuthenticatedUser(user.getId(), user.getEmail(), user.getRole());
	}
}
