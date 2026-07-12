package com.ympf.portfolio.common.exception;

import java.time.Clock;
import java.util.Comparator;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.ympf.portfolio.auth.exception.AuthenticationFailedException;
import com.ympf.portfolio.common.response.ErrorResponse;
import com.ympf.portfolio.common.response.FieldErrorResponse;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger LOGGER = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	private final Clock clock;

	public GlobalExceptionHandler(Clock clock) {
		this.clock = clock;
	}

	@ExceptionHandler(AuthenticationFailedException.class)
	public ResponseEntity<ErrorResponse> authenticationFailed() {
		return response(HttpStatus.UNAUTHORIZED, "AUTHENTICATION_FAILED", "Authentication failed");
	}

	@ExceptionHandler(ApiException.class)
	public ResponseEntity<ErrorResponse> apiError(ApiException exception) {
		ErrorResponse body = new ErrorResponse(
				exception.code(), exception.getMessage(), exception.fieldErrors(), clock.instant());
		return ResponseEntity.status(exception.status()).body(body);
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorResponse> validationFailed(MethodArgumentNotValidException exception) {
		List<FieldErrorResponse> fieldErrors = exception.getBindingResult().getFieldErrors().stream()
				.sorted(Comparator.comparing(FieldError::getField))
				.map(error -> new FieldErrorResponse(error.getField(), error.getDefaultMessage()))
				.toList();
		ErrorResponse body = new ErrorResponse(
				"VALIDATION_FAILED", "Request validation failed", fieldErrors, clock.instant());
		return ResponseEntity.badRequest().body(body);
	}

	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ErrorResponse> malformedRequest() {
		return response(HttpStatus.BAD_REQUEST, "MALFORMED_REQUEST", "Request body is malformed");
	}

	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	public ResponseEntity<ErrorResponse> invalidParameter() {
		return response(HttpStatus.BAD_REQUEST, "INVALID_PARAMETER", "Request parameter is invalid");
	}

	@ExceptionHandler(Exception.class)
	public ResponseEntity<ErrorResponse> unexpectedError(Exception exception) {
		LOGGER.error("Unhandled API error", exception);
		return response(HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR", "An unexpected error occurred");
	}

	private ResponseEntity<ErrorResponse> response(HttpStatus status, String code, String message) {
		return ResponseEntity.status(status).body(ErrorResponse.of(code, message, clock.instant()));
	}
}
