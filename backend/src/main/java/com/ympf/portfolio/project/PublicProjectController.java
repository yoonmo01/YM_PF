package com.ympf.portfolio.project;

import java.util.UUID;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.common.response.PageResponse;
import com.ympf.portfolio.project.ProjectDtos.PublicProjectDetail;
import com.ympf.portfolio.project.ProjectDtos.PublicProjectSummary;

@Validated
@RestController
@RequestMapping("/api/public/projects")
public class PublicProjectController {

	private final ProjectService service;

	public PublicProjectController(ProjectService service) { this.service = service; }

	@GetMapping
	public PageResponse<PublicProjectSummary> list(
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "12") @Min(1) @Max(100) int size,
			@RequestParam(required = false) UUID skillId,
			@RequestParam(required = false) Boolean featured) {
		return service.publicProjects(page, size, skillId, featured);
	}

	@GetMapping("/{slug}")
	public PublicProjectDetail detail(@PathVariable @Pattern(regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$") String slug) {
		return service.publicProject(slug);
	}
}
