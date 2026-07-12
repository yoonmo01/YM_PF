package com.ympf.portfolio.portfolio;

import java.time.Clock;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.ympf.portfolio.auth.repository.UserRepository;
import com.ympf.portfolio.certificate.Certificate;
import com.ympf.portfolio.certificate.CertificateRepository;
import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.education.Education;
import com.ympf.portfolio.education.EducationRepository;
import com.ympf.portfolio.experience.Experience;
import com.ympf.portfolio.experience.ExperienceRepository;
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
import com.ympf.portfolio.profile.Profile;
import com.ympf.portfolio.profile.ProfileRepository;
import com.ympf.portfolio.skill.Skill;
import com.ympf.portfolio.skill.SkillRepository;

@Service
public class PortfolioService {

	private final ProfileRepository profiles;
	private final ExperienceRepository experiences;
	private final EducationRepository educations;
	private final SkillRepository skills;
	private final CertificateRepository certificates;
	private final UserRepository users;
	private final JdbcTemplate jdbcTemplate;
	private final Clock clock;

	public PortfolioService(ProfileRepository profiles, ExperienceRepository experiences,
			EducationRepository educations, SkillRepository skills, CertificateRepository certificates,
			UserRepository users, JdbcTemplate jdbcTemplate, Clock clock) {
		this.profiles = profiles;
		this.experiences = experiences;
		this.educations = educations;
		this.skills = skills;
		this.certificates = certificates;
		this.users = users;
		this.jdbcTemplate = jdbcTemplate;
		this.clock = clock;
	}

	@Transactional(readOnly = true)
	public ProfileResponse profileForUser(UUID userId) {
		return profiles.findByUserId(userId).map(this::profileResponse).orElse(null);
	}

	@Transactional(readOnly = true)
	public ProfileResponse publicProfile() {
		return profiles.findFirstByOrderByCreatedAtAsc().map(this::profileResponse).orElse(null);
	}

	@Transactional
	public ProfileResponse upsertProfile(UUID userId, ProfileRequest request) {
		Instant now = clock.instant();
		Profile profile = profiles.findByUserId(userId).orElseGet(() -> new Profile(
				users.findById(userId).orElseThrow(() -> notFound("USER_NOT_FOUND", "User not found")),
				clean(request.name()), clean(request.headline()), clean(request.shortBio()), clean(request.longBio()),
				clean(request.email()), nullable(request.githubUrl()), nullable(request.linkedinUrl()), now));
		if (profiles.findByUserId(userId).isPresent()) {
			profile.update(clean(request.name()), clean(request.headline()), clean(request.shortBio()),
					clean(request.longBio()), clean(request.email()), nullable(request.githubUrl()),
					nullable(request.linkedinUrl()), now);
		}
		return profileResponse(profiles.save(profile));
	}

	@Transactional(readOnly = true)
	public List<ExperienceResponse> experiences() {
		return experiences.findAllByOrderByDisplayOrderAscStartDateDesc().stream().map(this::experienceResponse).toList();
	}

	@Transactional
	public ExperienceResponse createExperience(ExperienceRequest request) {
		validateExperienceDates(request);
		Instant now = clock.instant();
		return experienceResponse(experiences.save(new Experience(clean(request.organization()), clean(request.title()),
				clean(request.description()), request.startDate(), request.endDate(), request.current(), request.displayOrder(), now)));
	}

	@Transactional
	public ExperienceResponse updateExperience(UUID id, ExperienceRequest request) {
		validateExperienceDates(request);
		Experience entity = experiences.findById(id).orElseThrow(() -> notFound("EXPERIENCE_NOT_FOUND", "Experience not found"));
		entity.update(clean(request.organization()), clean(request.title()), clean(request.description()),
				request.startDate(), request.endDate(), request.current(), request.displayOrder(), clock.instant());
		return experienceResponse(entity);
	}

	@Transactional public void deleteExperience(UUID id) { requireNotUsed("resume_experiences", "experience_id", id, "EXPERIENCE_IN_USE"); requireDelete(experiences, id, "EXPERIENCE_NOT_FOUND"); }

	@Transactional(readOnly = true)
	public List<EducationResponse> educations() {
		return educations.findAllByOrderByDisplayOrderAscStartDateDesc().stream().map(this::educationResponse).toList();
	}

	@Transactional
	public EducationResponse createEducation(EducationRequest request) {
		validateDates(request.startDate(), request.endDate(), "endDate");
		Instant now = clock.instant();
		return educationResponse(educations.save(new Education(clean(request.institution()), clean(request.program()),
				clean(request.description()), request.startDate(), request.endDate(), request.displayOrder(), now)));
	}

	@Transactional
	public EducationResponse updateEducation(UUID id, EducationRequest request) {
		validateDates(request.startDate(), request.endDate(), "endDate");
		Education entity = educations.findById(id).orElseThrow(() -> notFound("EDUCATION_NOT_FOUND", "Education not found"));
		entity.update(clean(request.institution()), clean(request.program()), clean(request.description()),
				request.startDate(), request.endDate(), request.displayOrder(), clock.instant());
		return educationResponse(entity);
	}

	@Transactional public void deleteEducation(UUID id) { requireDelete(educations, id, "EDUCATION_NOT_FOUND"); }

	@Transactional(readOnly = true)
	public List<SkillResponse> skills(boolean publicOnly) {
		List<Skill> result = publicOnly ? skills.findAllByVisibleTrueOrderByCategoryAscDisplayOrderAscNameAsc()
				: skills.findAllByOrderByCategoryAscDisplayOrderAscNameAsc();
		return result.stream().map(this::skillResponse).toList();
	}

	@Transactional
	public SkillResponse createSkill(SkillRequest request) {
		ensureSkillNameAvailable(request.name(), null);
		return skillResponse(skills.save(new Skill(clean(request.name()), request.category(), request.displayOrder(),
				request.visible(), clock.instant())));
	}

	@Transactional
	public SkillResponse updateSkill(UUID id, SkillRequest request) {
		Skill entity = skills.findById(id).orElseThrow(() -> notFound("SKILL_NOT_FOUND", "Skill not found"));
		ensureSkillNameAvailable(request.name(), id);
		entity.update(clean(request.name()), request.category(), request.displayOrder(), request.visible(), clock.instant());
		return skillResponse(entity);
	}

	@Transactional
	public void deleteSkill(UUID id) {
		if (!skills.existsById(id)) throw notFound("SKILL_NOT_FOUND", "Skill not found");
		Integer count = jdbcTemplate.queryForObject("select count(*) from project_skills where skill_id = ?", Integer.class, id);
		if (count != null && count > 0) throw new ApiException(HttpStatus.CONFLICT, "SKILL_IN_USE", "Skill is used by a project");
		requireNotUsed("resume_skills", "skill_id", id, "SKILL_IN_USE");
		skills.deleteById(id);
	}

	@Transactional(readOnly = true)
	public List<CertificateResponse> certificates() {
		return certificates.findAllByOrderByDisplayOrderAscIssuedDateDesc().stream().map(this::certificateResponse).toList();
	}

	@Transactional
	public CertificateResponse createCertificate(CertificateRequest request) {
		validateOptionalDates(request.issuedDate(), request.expiresDate(), "expiresDate");
		return certificateResponse(certificates.save(new Certificate(clean(request.name()), clean(request.issuer()),
				request.issuedDate(), request.expiresDate(), nullable(request.credentialUrl()), nullable(request.score()),
				request.displayOrder(), clock.instant())));
	}

	@Transactional
	public CertificateResponse updateCertificate(UUID id, CertificateRequest request) {
		validateOptionalDates(request.issuedDate(), request.expiresDate(), "expiresDate");
		Certificate entity = certificates.findById(id).orElseThrow(() -> notFound("CERTIFICATE_NOT_FOUND", "Certificate not found"));
		entity.update(clean(request.name()), clean(request.issuer()), request.issuedDate(), request.expiresDate(),
				nullable(request.credentialUrl()), nullable(request.score()), request.displayOrder(), clock.instant());
		return certificateResponse(entity);
	}

	@Transactional public void deleteCertificate(UUID id) { requireDelete(certificates, id, "CERTIFICATE_NOT_FOUND"); }

	private void ensureSkillNameAvailable(String name, UUID currentId) {
		skills.findByNameIgnoreCase(clean(name)).filter(skill -> !skill.getId().equals(currentId)).ifPresent(skill -> {
			throw new ApiException(HttpStatus.CONFLICT, "SKILL_NAME_CONFLICT", "Skill name already exists");
		});
	}

	private void validateExperienceDates(ExperienceRequest request) {
		if ((request.current() && request.endDate() != null) || (!request.current() && request.endDate() == null)) {
			throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "Current experience must not have an end date");
		}
		if (request.endDate() != null) validateDates(request.startDate(), request.endDate(), "endDate");
	}

	private void validateOptionalDates(java.time.LocalDate start, java.time.LocalDate end, String field) {
		if (end != null) validateDates(start, end, field);
	}

	private void validateDates(java.time.LocalDate start, java.time.LocalDate end, String field) {
		if (end.isBefore(start)) throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", field + " precedes startDate");
	}

	private <T> void requireDelete(org.springframework.data.jpa.repository.JpaRepository<T, UUID> repository,
			UUID id, String code) {
		if (!repository.existsById(id)) throw notFound(code, "Content not found");
		repository.deleteById(id);
	}

	private void requireNotUsed(String table, String column, UUID id, String code) {
		Integer count = jdbcTemplate.queryForObject("select count(*) from " + table + " where " + column + " = ?", Integer.class, id);
		if (count != null && count > 0) throw new ApiException(HttpStatus.CONFLICT, code, "Content is used by a resume");
	}

	private ApiException notFound(String code, String message) { return new ApiException(HttpStatus.NOT_FOUND, code, message); }
	private String clean(String value) { return value.strip(); }
	private String nullable(String value) { return value == null || value.isBlank() ? null : value.strip(); }

	private ProfileResponse profileResponse(Profile p) { return new ProfileResponse(p.getName(), p.getHeadline(), p.getShortBio(), p.getLongBio(), p.getEmail(), p.getGithubUrl(), p.getLinkedinUrl(), p.getUpdatedAt()); }
	private ExperienceResponse experienceResponse(Experience e) { return new ExperienceResponse(e.getId(), e.getOrganization(), e.getTitle(), e.getDescription(), e.getStartDate(), e.getEndDate(), e.isCurrent(), e.getDisplayOrder(), e.getUpdatedAt()); }
	private EducationResponse educationResponse(Education e) { return new EducationResponse(e.getId(), e.getInstitution(), e.getProgram(), e.getDescription(), e.getStartDate(), e.getEndDate(), e.getDisplayOrder(), e.getUpdatedAt()); }
	private SkillResponse skillResponse(Skill s) { return new SkillResponse(s.getId(), s.getName(), s.getCategory(), s.getDisplayOrder(), s.isVisible(), s.getUpdatedAt()); }
	private CertificateResponse certificateResponse(Certificate c) { return new CertificateResponse(c.getId(), c.getName(), c.getIssuer(), c.getIssuedDate(), c.getExpiresDate(), c.getCredentialUrl(), c.getScore(), c.getDisplayOrder(), c.getUpdatedAt()); }
}
