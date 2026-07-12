package com.ympf.portfolio.common.exception;

import java.util.List;

import org.springframework.http.HttpStatus;

import com.ympf.portfolio.common.response.FieldErrorResponse;

public class ApiException extends RuntimeException {

	private final HttpStatus status;
	private final String code;
	private final List<FieldErrorResponse> fieldErrors;

	public ApiException(HttpStatus status, String code, String message) {
		this(status, code, message, List.of());
	}

	public ApiException(HttpStatus status, String code, String message, List<FieldErrorResponse> fieldErrors) {
		super(message);
		this.status = status;
		this.code = code;
		this.fieldErrors = List.copyOf(fieldErrors);
	}

	public HttpStatus status() {
		return status;
	}

	public String code() {
		return code;
	}

	public List<FieldErrorResponse> fieldErrors() {
		return fieldErrors;
	}
}
