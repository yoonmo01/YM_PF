package com.ympf.portfolio.common.validation;

import java.net.URI;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import org.springframework.util.StringUtils;

public class HttpsUrlValidator implements ConstraintValidator<HttpsUrl, String> {

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (!StringUtils.hasText(value)) {
			return true;
		}
		try {
			URI uri = URI.create(value);
			return "https".equalsIgnoreCase(uri.getScheme())
					&& uri.getHost() != null
					&& uri.getUserInfo() == null;
		}
		catch (IllegalArgumentException exception) {
			return false;
		}
	}
}
