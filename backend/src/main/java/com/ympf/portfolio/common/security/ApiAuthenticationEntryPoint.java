package com.ympf.portfolio.common.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import com.ympf.portfolio.common.response.ApiErrorWriter;

@Component
public class ApiAuthenticationEntryPoint implements AuthenticationEntryPoint {

	private final ApiErrorWriter errorWriter;

	public ApiAuthenticationEntryPoint(ApiErrorWriter errorWriter) {
		this.errorWriter = errorWriter;
	}

	@Override
	public void commence(
			HttpServletRequest request,
			HttpServletResponse response,
			AuthenticationException authException) throws IOException, ServletException {
		errorWriter.write(response, HttpStatus.UNAUTHORIZED.value(),
				"AUTHENTICATION_REQUIRED", "Administrator authentication is required");
	}
}
