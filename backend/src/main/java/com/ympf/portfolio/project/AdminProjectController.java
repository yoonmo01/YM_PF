package com.ympf.portfolio.project;

import java.net.URI;
import java.util.UUID;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.common.response.PageResponse;
import com.ympf.portfolio.project.ProjectDtos.AdminProjectDetail;
import com.ympf.portfolio.project.ProjectDtos.AdminProjectSummary;
import com.ympf.portfolio.project.ProjectDtos.ProjectRequest;

@Validated
@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectController {

	private final ProjectService service;

	public AdminProjectController(ProjectService service) { this.service = service; }

	@GetMapping
	public PageResponse<AdminProjectSummary> list(
			@RequestParam(defaultValue = "0") @Min(0) int page,
			@RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
			@RequestParam(required = false) ProjectStatus status,
			@RequestParam(required = false) @Size(max = 100) String q) {
		return service.adminProjects(page, size, status, q);
	}

	@PostMapping
	public ResponseEntity<AdminProjectDetail> create(@Valid @RequestBody ProjectRequest request) {
		AdminProjectDetail response = service.create(request);
		return ResponseEntity.created(URI.create("/api/admin/projects/" + response.id())).body(response);
	}

	@GetMapping("/{id}") public AdminProjectDetail get(@PathVariable UUID id) { return service.adminProject(id); }
	@PutMapping("/{id}") public AdminProjectDetail update(@PathVariable UUID id, @Valid @RequestBody ProjectRequest request) { return service.update(id, request); }
	@DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
	@PostMapping("/{id}/publish") public AdminProjectDetail publish(@PathVariable UUID id) { return service.publish(id); }
	@PostMapping("/{id}/archive") public AdminProjectDetail archive(@PathVariable UUID id) { return service.archive(id); }
}
