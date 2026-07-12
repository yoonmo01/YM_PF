package com.ympf.portfolio.auth.service;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.util.Locale;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.repository.UserRepository;

@Service
public class AdminBootstrapService {

	private static final Set<String> FORBIDDEN_PASSWORDS = Set.of(
			"admin123456", "changeme1234", "password1234", "change_me_password");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final Validator validator;
	private final AuthProperties properties;
	private final Clock clock;

	public AdminBootstrapService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			Validator validator,
			AuthProperties properties,
			Clock clock) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.validator = validator;
		this.properties = properties;
		this.clock = clock;
	}

	@Transactional
	public boolean bootstrapIfNecessary() {
		boolean hasEmail = StringUtils.hasText(properties.adminEmail());
		boolean hasPassword = StringUtils.hasText(properties.adminPassword());
		if (!hasEmail && !hasPassword) {
			return false;
		}
		if (hasEmail != hasPassword) {
			throw new IllegalStateException(
					"ADMIN_EMAIL and ADMIN_PASSWORD must either both be set or both be blank");
		}
		if (userRepository.count() != 0) {
			return false;
		}

		BootstrapCredentials credentials = new BootstrapCredentials(
				User.normalizeEmail(properties.adminEmail()), properties.adminPassword());
		Set<ConstraintViolation<BootstrapCredentials>> violations = validator.validate(credentials);
		String normalizedPassword = credentials.password().toLowerCase(Locale.ROOT);
		if (!violations.isEmpty() || FORBIDDEN_PASSWORDS.contains(normalizedPassword)
				|| credentials.password().equalsIgnoreCase(credentials.email())
				|| credentials.password().getBytes(StandardCharsets.UTF_8).length > 72) {
			throw new IllegalStateException("ADMIN_EMAIL or ADMIN_PASSWORD is invalid; bootstrap aborted");
		}

		String passwordHash = passwordEncoder.encode(credentials.password());
		userRepository.save(User.createAdmin(credentials.email(), passwordHash, clock.instant()));
		return true;
	}

	private record BootstrapCredentials(
			@NotBlank @Email @Size(max = 254) String email,
			@NotBlank @Size(min = 12, max = 128) String password) {
	}
}
