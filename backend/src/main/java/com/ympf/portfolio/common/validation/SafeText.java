package com.ympf.portfolio.common.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = SafeTextValidator.class)
public @interface SafeText {

	String message() default "must not contain HTML or control characters";

	Class<?>[] groups() default {};

	Class<? extends Payload>[] payload() default {};
}
