package com.ympf.portfolio.common.security;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.csrf.CsrfException;
import org.springframework.stereotype.Component;

import com.ympf.portfolio.common.response.ApiErrorWriter;

@Component
public class ApiAccessDeniedHandler implements AccessDeniedHandler {

	private final ApiErrorWriter errorWriter;

	public ApiAccessDeniedHandler(ApiErrorWriter errorWriter) {
		this.errorWriter = errorWriter;
	}

	@Override
	public void handle(
			HttpServletRequest request,
			HttpServletResponse response,
			AccessDeniedException accessDeniedException) throws IOException, ServletException {
		if (accessDeniedException instanceof CsrfException) {
			errorWriter.write(response, HttpStatus.FORBIDDEN.value(),
					"CSRF_INVALID", "A valid CSRF token is required");
			return;
		}
		errorWriter.write(response, HttpStatus.FORBIDDEN.value(),
				"ACCESS_DENIED", "Administrator permission is required");
	}
}
