package com.ympf.portfolio.media;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.media.MediaDtos.AdminProjectMediaResponse;
import com.ympf.portfolio.media.MediaDtos.ProjectMediaOrderRequest;
import com.ympf.portfolio.media.MediaDtos.ProjectMediaRequest;

@RestController
@RequestMapping("/api/admin/projects/{projectId}/media")
public class AdminProjectMediaController {
	private final MediaService service;
	public AdminProjectMediaController(MediaService service) { this.service = service; }
	@GetMapping public List<AdminProjectMediaResponse> list(@PathVariable UUID projectId) { return service.projectMedia(projectId); }
	@PostMapping public ResponseEntity<AdminProjectMediaResponse> attach(@PathVariable UUID projectId, @Valid @RequestBody ProjectMediaRequest request) { AdminProjectMediaResponse response = service.attach(projectId, request); return ResponseEntity.created(URI.create("/api/admin/projects/" + projectId + "/media/" + response.id())).body(response); }
	@PutMapping("/order") public List<AdminProjectMediaResponse> reorder(@PathVariable UUID projectId, @Valid @RequestBody ProjectMediaOrderRequest request) { return service.reorder(projectId, request); }
	@DeleteMapping("/{projectMediaId}") public ResponseEntity<Void> detach(@PathVariable UUID projectId, @PathVariable UUID projectMediaId) { service.detach(projectId, projectMediaId); return ResponseEntity.noContent().build(); }
}
