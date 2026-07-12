package com.ympf.portfolio.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class SafeTextValidator implements ConstraintValidator<SafeText, String> {

	@Override
	public boolean isValid(String value, ConstraintValidatorContext context) {
		if (value == null) {
			return true;
		}
		for (int index = 0; index < value.length(); index++) {
			char character = value.charAt(index);
			if (character == '<' || character == '>' || character == '\0'
					|| (Character.isISOControl(character) && character != '\n' && character != '\r' && character != '\t')) {
				return false;
			}
		}
		return true;
	}
}
