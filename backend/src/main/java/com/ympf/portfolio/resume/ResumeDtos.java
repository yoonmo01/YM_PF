package com.ympf.portfolio.resume;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.ympf.portfolio.common.validation.HttpsUrl;
import com.ympf.portfolio.common.validation.SafeText;

public final class ResumeDtos {
	private ResumeDtos() {}
	public record ExperienceSelectionRequest(@NotNull UUID experienceId, @Min(0) @Max(10000) int displayOrder,
			@Size(max = 10000) @SafeText String customDescription) {}
	public record ProjectSelectionRequest(@NotNull UUID projectId, @Min(0) @Max(10000) int displayOrder,
			@Size(max = 10000) @SafeText String customSummary) {}
	public record SkillSelectionRequest(@NotNull UUID skillId, @Min(0) @Max(10000) int displayOrder) {}
	public record ResumeRequest(
			@NotBlank @Size(max = 200) @SafeText String title,
			@NotBlank @Size(max = 200) @SafeText String companyName,
			@NotBlank @Size(max = 200) @SafeText String positionName,
			@Size(max = 500) @HttpsUrl String jobPostingUrl,
			LocalDate deadline,
			@NotBlank @Size(max = 10000) @SafeText String customSummary,
			UUID profileMediaId,
			@Size(max = 20000) @SafeText String notes,
			@NotNull @Size(max = 50) List<@Valid ExperienceSelectionRequest> experiences,
			@NotNull @Size(max = 50) List<@Valid ProjectSelectionRequest> projects,
			@NotNull @Size(max = 100) List<@Valid SkillSelectionRequest> skills) {}
	public record ResumeSummaryResponse(UUID id, String title, String companyName, String positionName,
			LocalDate deadline, ResumeStatus status, boolean hasPdf, Instant submittedAt, Instant updatedAt) {}
	public record ExperienceItem(UUID id, String organization, String title, String description,
			LocalDate startDate, LocalDate endDate, boolean current, int displayOrder) {}
	public record ProjectItem(UUID id, String title, String summary, String role, String results, int displayOrder) {}
	public record SkillItem(UUID id, String name, String category, int displayOrder) {}
	public record ResumeDetailResponse(UUID id, String title, String companyName, String positionName,
			String jobPostingUrl, LocalDate deadline, String customSummary, UUID profileMediaId, String profileMediaUrl,
			String notes, ResumeStatus status, UUID pdfMediaId, String pdfUrl, Instant submittedAt,
			Instant createdAt, Instant updatedAt, List<ExperienceItem> experiences, List<ProjectItem> projects,
			List<SkillItem> skills) {}
	public record ResumePdfResponse(UUID mediaId, String url, String filename, Instant generatedAt) {}
}
