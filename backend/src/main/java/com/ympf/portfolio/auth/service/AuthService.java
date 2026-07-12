package com.ympf.portfolio.auth.service;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.domain.RefreshSession;
import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.domain.UserRole;
import com.ympf.portfolio.auth.dto.AuthUserResponse;
import com.ympf.portfolio.auth.exception.AuthenticationFailedException;
import com.ympf.portfolio.auth.repository.RefreshSessionRepository;
import com.ympf.portfolio.auth.repository.UserRepository;
import com.ympf.portfolio.auth.security.JwtTokenService;
import com.ympf.portfolio.auth.security.RefreshTokenService;
import com.ympf.portfolio.auth.security.RefreshTokenService.GeneratedRefreshToken;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final RefreshSessionRepository refreshSessionRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtTokenService jwtTokenService;
	private final RefreshTokenService refreshTokenService;
	private final AuthProperties properties;
	private final Clock clock;
	private final String dummyPasswordHash;

	public AuthService(
			UserRepository userRepository,
			RefreshSessionRepository refreshSessionRepository,
			PasswordEncoder passwordEncoder,
			JwtTokenService jwtTokenService,
			RefreshTokenService refreshTokenService,
			AuthProperties properties,
			Clock clock) {
		this.userRepository = userRepository;
		this.refreshSessionRepository = refreshSessionRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtTokenService = jwtTokenService;
		this.refreshTokenService = refreshTokenService;
		this.properties = properties;
		this.clock = clock;
		this.dummyPasswordHash = passwordEncoder.encode(UUID.randomUUID().toString());
	}

	@Transactional
	public AuthTokens login(String email, String password) {
		if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
			throw new AuthenticationFailedException();
		}
		Optional<User> candidate = userRepository.findByEmail(User.normalizeEmail(email));
		String passwordHash = candidate.map(User::getPasswordHash).orElse(dummyPasswordHash);
		boolean passwordMatches = passwordEncoder.matches(password, passwordHash);
		if (candidate.isEmpty() || !passwordMatches) {
			throw new AuthenticationFailedException();
		}
		User user = candidate.orElseThrow();
		if (!user.isEnabled() || user.getRole() != UserRole.ADMIN) {
			throw new AuthenticationFailedException();
		}
		return issueTokens(user, clock.instant());
	}

	@Transactional
	public AuthTokens refresh(String rawRefreshToken) {
		if (!StringUtils.hasText(rawRefreshToken)) {
			throw new AuthenticationFailedException();
		}
		String tokenHash = refreshTokenService.hash(rawRefreshToken);
		RefreshSession currentSession = refreshSessionRepository.findByTokenHashForUpdate(tokenHash)
				.orElseThrow(AuthenticationFailedException::new);
		Instant now = clock.instant();
		if (!currentSession.isUsableAt(now) || currentSession.getUser().getRole() != UserRole.ADMIN) {
			throw new AuthenticationFailedException();
		}

		currentSession.revoke(now);
		return issueTokens(currentSession.getUser(), now);
	}

	@Transactional
	public void logout(String rawRefreshToken) {
		if (!StringUtils.hasText(rawRefreshToken)) {
			return;
		}
		String tokenHash = refreshTokenService.hash(rawRefreshToken);
		refreshSessionRepository.findByTokenHashForUpdate(tokenHash)
				.ifPresent(session -> session.revoke(clock.instant()));
	}

	private AuthTokens issueTokens(User user, Instant now) {
		GeneratedRefreshToken refreshToken = refreshTokenService.generate();
		RefreshSession session = RefreshSession.create(
				user,
				refreshToken.tokenHash(),
				now,
				now.plus(properties.refreshTokenTtl()));
		refreshSessionRepository.save(session);
		return new AuthTokens(
				jwtTokenService.createAccessToken(user),
				refreshToken.rawToken(),
				AuthUserResponse.from(user));
	}
}
