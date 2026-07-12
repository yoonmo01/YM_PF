package com.ympf.portfolio.project;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.ympf.portfolio.common.validation.HttpsUrl;
import com.ympf.portfolio.common.validation.SafeText;
import com.ympf.portfolio.media.MediaDtos.PublicMediaResponse;
import com.ympf.portfolio.skill.SkillCategory;

public final class ProjectDtos {

	private ProjectDtos() {}

	public record ProblemSolutionRequest(
			@NotBlank @Size(max = 10000) @SafeText String problem,
			@NotBlank @Size(max = 10000) @SafeText String cause,
			@NotBlank @Size(max = 10000) @SafeText String solution,
			@NotBlank @Size(max = 10000) @SafeText String verification) {}

	public record ProjectRequest(
			@NotBlank @Size(max = 200) @SafeText String title,
			@NotBlank @Size(max = 160) @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$") String slug,
			@NotBlank @Size(max = 500) @SafeText String summary,
			@Size(max = 20000) @SafeText String background,
			@Size(max = 20000) @SafeText String problem,
			@Size(max = 20000) @SafeText String goal,
			@Size(max = 300) @SafeText String role,
			@Size(max = 20000) @SafeText String responsibilities,
			@Size(max = 20000) @SafeText String implementation,
			@Size(max = 20000) @SafeText String technicalDecisions,
			@Size(max = 20000) @SafeText String results,
			@Size(max = 20000) @SafeText String limitations,
			@Size(max = 20000) @SafeText String retrospective,
			LocalDate startDate,
			LocalDate endDate,
			@Min(1) @Max(1000) Integer teamSize,
			@Size(max = 500) @HttpsUrl String githubUrl,
			@Size(max = 500) @HttpsUrl String demoUrl,
			boolean featured,
			@Min(0) @Max(10000) int displayOrder,
			@NotNull @Size(max = 100) List<UUID> skillIds,
			@NotNull @Size(max = 50) List<@Valid ProblemSolutionRequest> problemSolutions) {}

	public record SkillItem(UUID id, String name, SkillCategory category) {}
	public record ProblemSolutionResponse(UUID id, String problem, String cause, String solution,
			String verification, int displayOrder) {}
	public record PublicSkillItem(String name, SkillCategory category) {}
	public record PublicProblemSolution(String problem, String cause, String solution, String verification) {}

	public record AdminProjectSummary(
			UUID id, String slug, String title, String summary, ProjectStatus status,
			boolean featured, int displayOrder, LocalDate startDate, Instant updatedAt,
			List<SkillItem> skills) {}

	public record AdminProjectDetail(
			UUID id, String slug, String title, String summary, String background, String problem,
			String goal, String role, String responsibilities, String implementation,
			String technicalDecisions, String results, String limitations, String retrospective,
			LocalDate startDate, LocalDate endDate, Integer teamSize, String githubUrl, String demoUrl,
			ProjectStatus status, boolean featured, int displayOrder, Instant createdAt, Instant updatedAt,
			List<SkillItem> skills, List<ProblemSolutionResponse> problemSolutions) {}

	public record PublicProjectSummary(
			String slug, String title, String summary, String role, String results,
			boolean featured, LocalDate startDate, List<PublicSkillItem> skills, List<PublicMediaResponse> media) {}

	public record PublicProjectDetail(
			String slug, String title, String summary, String background, String problem, String goal,
			String role, String responsibilities, String implementation, String technicalDecisions,
			String results, String limitations, String retrospective, LocalDate startDate, LocalDate endDate,
			Integer teamSize, String githubUrl, String demoUrl, List<PublicSkillItem> skills,
			List<PublicProblemSolution> problemSolutions, List<PublicMediaResponse> media) {}
}
