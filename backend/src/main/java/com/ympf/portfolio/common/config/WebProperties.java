package com.ympf.portfolio.common.config;

import java.net.URI;
import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties("app.web")
public record WebProperties(List<String> allowedOrigins) {

	public WebProperties {
		if (allowedOrigins == null || allowedOrigins.isEmpty()) {
			throw new IllegalArgumentException("ALLOWED_ORIGINS must contain at least one exact origin");
		}
		allowedOrigins = allowedOrigins.stream().map(String::strip).distinct().toList();
		for (String origin : allowedOrigins) {
			validateOrigin(origin);
		}
	}

	private static void validateOrigin(String origin) {
		if (origin.isBlank() || origin.contains("*")) {
			throw new IllegalArgumentException("ALLOWED_ORIGINS must not be blank or contain wildcards");
		}
		URI uri;
		try {
			uri = URI.create(origin);
		}
		catch (IllegalArgumentException exception) {
			throw new IllegalArgumentException("ALLOWED_ORIGINS contains an invalid URI", exception);
		}
		if (!("http".equalsIgnoreCase(uri.getScheme()) || "https".equalsIgnoreCase(uri.getScheme()))
				|| uri.getHost() == null || uri.getUserInfo() != null || uri.getQuery() != null
				|| uri.getFragment() != null || (uri.getPath() != null && !uri.getPath().isEmpty())) {
			throw new IllegalArgumentException("ALLOWED_ORIGINS entries must be exact HTTP(S) origins");
		}
	}
}
