package com.ympf.portfolio.auth.security;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import com.ympf.portfolio.auth.config.AuthProperties;
import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.domain.UserRole;
import com.ympf.portfolio.auth.exception.InvalidAccessTokenException;
import com.ympf.portfolio.auth.repository.UserRepository;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtTokenService jwtTokenService;
	private final UserRepository userRepository;
	private final AuthProperties properties;

	public JwtAuthenticationFilter(
			JwtTokenService jwtTokenService,
			UserRepository userRepository,
			AuthProperties properties) {
		this.jwtTokenService = jwtTokenService;
		this.userRepository = userRepository;
		this.properties = properties;
	}

	@Override
	protected void doFilterInternal(
			HttpServletRequest request,
			HttpServletResponse response,
			FilterChain filterChain) throws ServletException, IOException {
		if (SecurityContextHolder.getContext().getAuthentication() == null) {
			readAccessCookie(request).ifPresent(token -> authenticate(token, request));
		}
		filterChain.doFilter(request, response);
	}

	private void authenticate(String token, HttpServletRequest request) {
		try {
			AccessTokenClaims claims = jwtTokenService.parseAndValidate(token);
			User user = userRepository.findById(claims.subject()).orElse(null);
			if (user == null || !user.isEnabled() || user.getRole() != UserRole.ADMIN
					|| user.getRole() != claims.role()) {
				return;
			}
			AuthenticatedUser principal = AuthenticatedUser.from(user);
			UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
					principal,
					null,
					List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name())));
			authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}
		catch (InvalidAccessTokenException exception) {
			SecurityContextHolder.clearContext();
		}
	}

	private java.util.Optional<String> readAccessCookie(HttpServletRequest request) {
		if (request.getCookies() == null) {
			return java.util.Optional.empty();
		}
		return Arrays.stream(request.getCookies())
				.filter(cookie -> properties.accessCookieName().equals(cookie.getName()))
				.map(Cookie::getValue)
				.findFirst();
	}
}
