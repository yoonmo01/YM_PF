package com.ympf.portfolio.portfolio;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.ympf.portfolio.common.validation.HttpsUrl;
import com.ympf.portfolio.common.validation.SafeText;
import com.ympf.portfolio.skill.SkillCategory;

public final class PortfolioDtos {

	private PortfolioDtos() {}

	public record ProfileRequest(
			@NotBlank @Size(max = 100) @SafeText String name,
			@NotBlank @Size(max = 160) @SafeText String headline,
			@NotBlank @Size(max = 500) @SafeText String shortBio,
			@NotBlank @Size(max = 10000) @SafeText String longBio,
			@NotBlank @Email @Size(max = 254) String email,
			@Size(max = 500) @HttpsUrl String githubUrl,
			@Size(max = 500) @HttpsUrl String linkedinUrl) {}

	public record ProfileResponse(
			String name, String headline, String shortBio, String longBio,
			String email, String githubUrl, String linkedinUrl, Instant updatedAt) {}

	public record ExperienceRequest(
			@NotBlank @Size(max = 160) @SafeText String organization,
			@NotBlank @Size(max = 160) @SafeText String title,
			@NotBlank @Size(max = 10000) @SafeText String description,
			@NotNull LocalDate startDate,
			LocalDate endDate,
			boolean current,
			@Min(0) @Max(10000) int displayOrder) {}

	public record ExperienceResponse(
			UUID id, String organization, String title, String description,
			LocalDate startDate, LocalDate endDate, boolean current, int displayOrder,
			Instant updatedAt) {}

	public record EducationRequest(
			@NotBlank @Size(max = 160) @SafeText String institution,
			@NotBlank @Size(max = 200) @SafeText String program,
			@NotBlank @Size(max = 10000) @SafeText String description,
			@NotNull LocalDate startDate,
			@NotNull LocalDate endDate,
			@Min(0) @Max(10000) int displayOrder) {}

	public record EducationResponse(
			UUID id, String institution, String program, String description,
			LocalDate startDate, LocalDate endDate, int displayOrder, Instant updatedAt) {}

	public record SkillRequest(
			@NotBlank @Size(max = 100) @SafeText String name,
			@NotNull SkillCategory category,
			@Min(0) @Max(10000) int displayOrder,
			boolean visible) {}

	public record SkillResponse(
			UUID id, String name, SkillCategory category, int displayOrder,
			boolean visible, Instant updatedAt) {}

	public record CertificateRequest(
			@NotBlank @Size(max = 200) @SafeText String name,
			@NotBlank @Size(max = 160) @SafeText String issuer,
			@NotNull LocalDate issuedDate,
			LocalDate expiresDate,
			@Size(max = 500) @HttpsUrl String credentialUrl,
			@Size(max = 100) @SafeText String score,
			@Min(0) @Max(10000) int displayOrder) {}

	public record CertificateResponse(
			UUID id, String name, String issuer, LocalDate issuedDate, LocalDate expiresDate,
			String credentialUrl, String score, int displayOrder, Instant updatedAt) {}
}
