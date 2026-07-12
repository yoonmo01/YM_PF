package com.ympf.portfolio.auth.exception;

public class AuthenticationFailedException extends RuntimeException {

	public AuthenticationFailedException() {
		super("Authentication failed");
	}
}
