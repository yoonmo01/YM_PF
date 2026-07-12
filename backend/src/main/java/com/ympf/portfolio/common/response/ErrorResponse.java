package com.ympf.portfolio.common.response;

import java.time.Instant;
import java.util.List;

public record ErrorResponse(
		String code,
		String message,
		List<FieldErrorResponse> fieldErrors,
		Instant timestamp) {

	public static ErrorResponse of(String code, String message, Instant timestamp) {
		return new ErrorResponse(code, message, List.of(), timestamp);
	}
}
