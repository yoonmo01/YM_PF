package com.ympf.portfolio.resume;

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

import com.ympf.portfolio.resume.ResumeDtos.ResumeDetailResponse;
import com.ympf.portfolio.resume.ResumeDtos.ResumePdfResponse;
import com.ympf.portfolio.resume.ResumeDtos.ResumeRequest;
import com.ympf.portfolio.resume.ResumeDtos.ResumeSummaryResponse;

@RestController
@RequestMapping("/api/admin/resumes")
public class AdminResumeController {
	private final ResumeService service; public AdminResumeController(ResumeService service) { this.service = service; }
	@GetMapping public List<ResumeSummaryResponse> list() { return service.list(); }
	@PostMapping public ResponseEntity<ResumeDetailResponse> create(@Valid @RequestBody ResumeRequest request) { ResumeDetailResponse response = service.create(request); return ResponseEntity.created(URI.create("/api/admin/resumes/" + response.id())).body(response); }
	@GetMapping("/{id}") public ResumeDetailResponse get(@PathVariable UUID id) { return service.get(id); }
	@PutMapping("/{id}") public ResumeDetailResponse update(@PathVariable UUID id, @Valid @RequestBody ResumeRequest request) { return service.update(id, request); }
	@DeleteMapping("/{id}") public ResponseEntity<Void> delete(@PathVariable UUID id) { service.delete(id); return ResponseEntity.noContent().build(); }
	@PostMapping("/{id}/copy") public ResponseEntity<ResumeDetailResponse> copy(@PathVariable UUID id) { ResumeDetailResponse response = service.copy(id); return ResponseEntity.created(URI.create("/api/admin/resumes/" + response.id())).body(response); }
	@PostMapping("/{id}/preview") public ResumeDetailResponse preview(@PathVariable UUID id) { return service.get(id); }
	@PostMapping("/{id}/pdf") public ResumePdfResponse pdf(@PathVariable UUID id) { return service.generatePdf(id); }
	@PostMapping("/{id}/ready") public ResumeDetailResponse ready(@PathVariable UUID id) { return service.ready(id); }
	@PostMapping("/{id}/submit") public ResumeDetailResponse submit(@PathVariable UUID id) { return service.submit(id); }
	@PostMapping("/{id}/archive") public ResumeDetailResponse archive(@PathVariable UUID id) { return service.archive(id); }
}
