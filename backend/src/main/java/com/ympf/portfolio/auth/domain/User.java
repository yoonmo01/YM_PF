package com.ympf.portfolio.auth.domain;

import java.time.Instant;
import java.util.Locale;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "users")
public class User {

	@Id
	private UUID id;

	@Column(nullable = false, unique = true, length = 320)
	private String email;

	@Column(name = "password_hash", nullable = false, length = 60)
	private String passwordHash;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 32)
	private UserRole role;

	@Column(nullable = false)
	private boolean enabled;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@Column(name = "updated_at", nullable = false)
	private Instant updatedAt;

	protected User() {
	}

	private User(UUID id, String email, String passwordHash, UserRole role, Instant now) {
		this.id = id;
		this.email = normalizeEmail(email);
		this.passwordHash = passwordHash;
		this.role = role;
		this.enabled = true;
		this.createdAt = now;
		this.updatedAt = now;
	}

	public static User createAdmin(String email, String passwordHash, Instant now) {
		return new User(UUID.randomUUID(), email, passwordHash, UserRole.ADMIN, now);
	}

	public static String normalizeEmail(String email) {
		return email.strip().toLowerCase(Locale.ROOT);
	}

	public UUID getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getPasswordHash() {
		return passwordHash;
	}

	public UserRole getRole() {
		return role;
	}

	public boolean isEnabled() {
		return enabled;
	}

	public void disable(Instant now) {
		this.enabled = false;
		this.updatedAt = now;
	}

	public void enable(Instant now) {
		this.enabled = true;
		this.updatedAt = now;
	}
}
