package com.ympf.portfolio.portfolio;

import java.net.URI;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.auth.security.AuthenticatedUser;
import com.ympf.portfolio.portfolio.PortfolioDtos.CertificateRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.CertificateResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.EducationRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.EducationResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.ExperienceRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.ExperienceResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.ProfileRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.ProfileResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.SkillRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.SkillResponse;

@RestController
@RequestMapping("/api/admin")
public class AdminPortfolioController {

	private final PortfolioService service;

	public AdminPortfolioController(PortfolioService service) {
		this.service = service;
	}

	@GetMapping("/profile")
	public ResponseEntity<ProfileResponse> profile(@AuthenticationPrincipal AuthenticatedUser user) {
		ProfileResponse response = service.profileForUser(user.id());
		return response == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(response);
	}

	@PutMapping("/profile")
	public ProfileResponse updateProfile(@AuthenticationPrincipal AuthenticatedUser user,
			@Valid @RequestBody ProfileRequest request) {
		return service.upsertProfile(user.id(), request);
	}

	@GetMapping("/experiences") public List<ExperienceResponse> experiences() { return service.experiences(); }
	@PostMapping("/experiences") public ResponseEntity<ExperienceResponse> createExperience(@Valid @RequestBody ExperienceRequest request) {
		ExperienceResponse response = service.createExperience(request);
		return ResponseEntity.created(URI.create("/api/admin/experiences/" + response.id())).body(response);
	}
	@GetMapping("/experiences/{id}") public ExperienceResponse experience(@PathVariable UUID id) { return service.experiences().stream().filter(item -> item.id().equals(id)).findFirst().orElseThrow(() -> new com.ympf.portfolio.common.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "EXPERIENCE_NOT_FOUND", "Experience not found")); }
	@PutMapping("/experiences/{id}") public ExperienceResponse updateExperience(@PathVariable UUID id, @Valid @RequestBody ExperienceRequest request) { return service.updateExperience(id, request); }
	@DeleteMapping("/experiences/{id}") public ResponseEntity<Void> deleteExperience(@PathVariable UUID id) { service.deleteExperience(id); return ResponseEntity.noContent().build(); }

	@GetMapping("/educations") public List<EducationResponse> educations() { return service.educations(); }
	@PostMapping("/educations") public ResponseEntity<EducationResponse> createEducation(@Valid @RequestBody EducationRequest request) { EducationResponse response = service.createEducation(request); return ResponseEntity.created(URI.create("/api/admin/educations/" + response.id())).body(response); }
	@GetMapping("/educations/{id}") public EducationResponse education(@PathVariable UUID id) { return service.educations().stream().filter(item -> item.id().equals(id)).findFirst().orElseThrow(() -> new com.ympf.portfolio.common.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "EDUCATION_NOT_FOUND", "Education not found")); }
	@PutMapping("/educations/{id}") public EducationResponse updateEducation(@PathVariable UUID id, @Valid @RequestBody EducationRequest request) { return service.updateEducation(id, request); }
	@DeleteMapping("/educations/{id}") public ResponseEntity<Void> deleteEducation(@PathVariable UUID id) { service.deleteEducation(id); return ResponseEntity.noContent().build(); }

	@GetMapping("/skills") public List<SkillResponse> skills() { return service.skills(false); }
	@PostMapping("/skills") public ResponseEntity<SkillResponse> createSkill(@Valid @RequestBody SkillRequest request) { SkillResponse response = service.createSkill(request); return ResponseEntity.created(URI.create("/api/admin/skills/" + response.id())).body(response); }
	@GetMapping("/skills/{id}") public SkillResponse skill(@PathVariable UUID id) { return service.skills(false).stream().filter(item -> item.id().equals(id)).findFirst().orElseThrow(() -> new com.ympf.portfolio.common.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "SKILL_NOT_FOUND", "Skill not found")); }
	@PutMapping("/skills/{id}") public SkillResponse updateSkill(@PathVariable UUID id, @Valid @RequestBody SkillRequest request) { return service.updateSkill(id, request); }
	@DeleteMapping("/skills/{id}") public ResponseEntity<Void> deleteSkill(@PathVariable UUID id) { service.deleteSkill(id); return ResponseEntity.noContent().build(); }

	@GetMapping("/certificates") public List<CertificateResponse> certificates() { return service.certificates(); }
	@PostMapping("/certificates") public ResponseEntity<CertificateResponse> createCertificate(@Valid @RequestBody CertificateRequest request) { CertificateResponse response = service.createCertificate(request); return ResponseEntity.created(URI.create("/api/admin/certificates/" + response.id())).body(response); }
	@GetMapping("/certificates/{id}") public CertificateResponse certificate(@PathVariable UUID id) { return service.certificates().stream().filter(item -> item.id().equals(id)).findFirst().orElseThrow(() -> new com.ympf.portfolio.common.exception.ApiException(org.springframework.http.HttpStatus.NOT_FOUND, "CERTIFICATE_NOT_FOUND", "Certificate not found")); }
	@PutMapping("/certificates/{id}") public CertificateResponse updateCertificate(@PathVariable UUID id, @Valid @RequestBody CertificateRequest request) { return service.updateCertificate(id, request); }
	@DeleteMapping("/certificates/{id}") public ResponseEntity<Void> deleteCertificate(@PathVariable UUID id) { service.deleteCertificate(id); return ResponseEntity.noContent().build(); }
}
