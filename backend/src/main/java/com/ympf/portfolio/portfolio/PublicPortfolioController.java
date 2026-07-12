package com.ympf.portfolio.portfolio;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.portfolio.PortfolioDtos.CertificateResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.EducationResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.ExperienceResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.ProfileResponse;
import com.ympf.portfolio.portfolio.PortfolioDtos.SkillResponse;

@RestController
@RequestMapping("/api/public")
public class PublicPortfolioController {

	private final PortfolioService service;

	public PublicPortfolioController(PortfolioService service) {
		this.service = service;
	}

	@GetMapping("/profile")
	public ResponseEntity<ProfileResponse> profile() {
		ProfileResponse response = service.publicProfile();
		return response == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(response);
	}

	@GetMapping("/experiences") public List<ExperienceResponse> experiences() { return service.experiences(); }
	@GetMapping("/educations") public List<EducationResponse> educations() { return service.educations(); }
	@GetMapping("/skills") public List<SkillResponse> skills() { return service.skills(true); }
	@GetMapping("/certificates") public List<CertificateResponse> certificates() { return service.certificates(); }
}
