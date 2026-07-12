package com.ympf.portfolio.auth.exception;

public class InvalidAccessTokenException extends RuntimeException {

	public InvalidAccessTokenException() {
		super("Invalid access token");
	}

	public InvalidAccessTokenException(Throwable cause) {
		super("Invalid access token", cause);
	}
}
