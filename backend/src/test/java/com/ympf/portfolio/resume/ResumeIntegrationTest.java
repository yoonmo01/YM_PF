package com.ympf.portfolio.resume;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.ympf.portfolio.auth.repository.UserRepository;
import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.experience.ExperienceRepository;
import com.ympf.portfolio.media.MediaService;
import com.ympf.portfolio.portfolio.PortfolioDtos.ExperienceRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.ProfileRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.SkillRequest;
import com.ympf.portfolio.portfolio.PortfolioService;
import com.ympf.portfolio.project.ProjectDtos.ProblemSolutionRequest;
import com.ympf.portfolio.project.ProjectDtos.ProjectRequest;
import com.ympf.portfolio.project.ProjectService;
import com.ympf.portfolio.resume.ResumeDtos.ExperienceSelectionRequest;
import com.ympf.portfolio.resume.ResumeDtos.ProjectSelectionRequest;
import com.ympf.portfolio.resume.ResumeDtos.ResumeRequest;
import com.ympf.portfolio.resume.ResumeDtos.SkillSelectionRequest;
import com.ympf.portfolio.skill.SkillCategory;
import com.ympf.portfolio.support.PostgresTestContainerConfiguration;

@SpringBootTest(properties = {
		"app.auth.jwt-secret=test-secret-that-is-at-least-thirty-two-bytes", "app.auth.issuer=resume-test",
		"app.auth.audience=resume-test", "app.auth.access-token-ttl=PT5M", "app.auth.refresh-token-ttl=P1D",
		"app.auth.access-cookie-name=test_access", "app.auth.refresh-cookie-name=test_refresh",
		"app.auth.access-cookie-path=/", "app.auth.refresh-cookie-path=/api/auth", "app.auth.cookie-secure=false",
		"app.auth.cookie-same-site=Lax", "app.auth.admin-email=admin@example.com",
		"app.auth.admin-password=test-password", "app.web.allowed-origins=http://localhost:3000",
		"app.media.provider=local", "app.media.local-path=${java.io.tmpdir}/ympf-resume-media"
})
@AutoConfigureMockMvc
@Import(PostgresTestContainerConfiguration.class)
class ResumeIntegrationTest {
	@Autowired ResumeService service; @Autowired ResumeRepository resumes;
	@Autowired ResumeExperienceRepository resumeExperiences; @Autowired ResumeProjectRepository resumeProjects;
	@Autowired ResumeSkillRepository resumeSkills; @Autowired PortfolioService portfolio; @Autowired ProjectService projects;
	@Autowired UserRepository users; @Autowired ExperienceRepository experiences; @Autowired MediaService media; @Autowired MockMvc mockMvc;

	@BeforeEach void cleanResumes() { resumeExperiences.deleteAll(); resumeProjects.deleteAll(); resumeSkills.deleteAll(); resumes.deleteAll(); }

	@Test
	void crudCopySelectionsAndLifecycleWithPdfWork() {
		Fixture fixture = fixture(); ResumeRequest request = request(fixture);
		var created = service.create(request);
		assertThat(created.status()).isEqualTo(ResumeStatus.DRAFT); assertThat(created.experiences()).hasSize(1);
		assertThat(created.projects()).hasSize(1); assertThat(created.skills()).extracting("name").containsExactly("Resume Java");

		var copied = service.copy(created.id());
		assertThat(copied.id()).isNotEqualTo(created.id()); assertThat(copied.status()).isEqualTo(ResumeStatus.DRAFT);
		assertThat(copied.pdfMediaId()).isNull(); assertThat(copied.experiences()).hasSize(1);

		var ready = service.ready(created.id()); assertThat(ready.status()).isEqualTo(ResumeStatus.READY);
		assertThatThrownBy(() -> service.submit(created.id())).isInstanceOf(ApiException.class).extracting("code").isEqualTo("INVALID_RESUME_STATE");
		var pdf = service.generatePdf(created.id()); assertThat(pdf.filename()).endsWith(".pdf");
		byte[] bytes = media.content(pdf.mediaId(), false).bytes(); assertThat(new String(bytes, 0, 4, java.nio.charset.StandardCharsets.US_ASCII)).isEqualTo("%PDF");
		var submitted = service.submit(created.id()); assertThat(submitted.status()).isEqualTo(ResumeStatus.SUBMITTED); assertThat(submitted.submittedAt()).isNotNull();
		assertThatThrownBy(() -> service.update(created.id(), request)).isInstanceOf(ApiException.class).extracting("code").isEqualTo("INVALID_RESUME_STATE");
		assertThatThrownBy(() -> portfolio.deleteExperience(fixture.experienceId)).isInstanceOf(ApiException.class).extracting("code").isEqualTo("EXPERIENCE_IN_USE");
		assertThatThrownBy(() -> projects.delete(fixture.projectId)).isInstanceOf(ApiException.class).extracting("code").isEqualTo("PROJECT_IN_USE");
		assertThatThrownBy(() -> portfolio.deleteSkill(fixture.skillId)).isInstanceOf(ApiException.class).extracting("code").isEqualTo("SKILL_IN_USE");
	}

	@Test
	void resumeApisRemainAdministratorOnlyAndNeverBecomePublic() throws Exception {
		mockMvc.perform(get("/api/admin/resumes")).andExpect(status().isUnauthorized());
		mockMvc.perform(get("/api/public/resumes")).andExpect(status().isNotFound());
		mockMvc.perform(post("/api/admin/resumes").with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON).content("{}"))
				.andExpect(status().isForbidden()).andExpect(jsonPath("$.code").value("CSRF_INVALID"));
	}

	private Fixture fixture() {
		UUID userId = users.findByEmail("admin@example.com").orElseThrow().getId();
		portfolio.upsertProfile(userId, new ProfileRequest("홍길동", "백엔드 개발자", "짧은 소개", "상세 소개", "public@example.com", "https://github.com/example", null));
		UUID experienceId = portfolio.createExperience(new ExperienceRequest("Example", "Backend Engineer", "API와 데이터 모델 구현", LocalDate.of(2024, 1, 1), null, true, 0)).id();
		UUID skillId = portfolio.createSkill(new SkillRequest("Resume Java", SkillCategory.BACKEND, 0, true)).id();
		UUID projectId = projects.create(new ProjectRequest("Resume Project", "resume-project-phase4", "채용 포트폴리오", "배경", "문제", "목표", "백엔드", "담당 업무", "구현", "선택", "성과", "한계", "회고", LocalDate.of(2025, 1, 1), LocalDate.of(2025, 3, 1), 1, "https://github.com/example/resume", null, true, 0, List.of(skillId), List.of(new ProblemSolutionRequest("문제", "원인", "해결", "검증")))).id();
		return new Fixture(experienceId, projectId, skillId);
	}

	private ResumeRequest request(Fixture fixture) { return new ResumeRequest("Example Backend 지원", "Example Corp", "Backend Engineer", "https://example.com/jobs/1", LocalDate.now().plusMonths(1), "Spring 기반 API 개발 경험을 강조합니다.", null, "비공개 메모", List.of(new ExperienceSelectionRequest(fixture.experienceId, 0, "맞춤 경력 설명")), List.of(new ProjectSelectionRequest(fixture.projectId, 0, "맞춤 프로젝트 요약")), List.of(new SkillSelectionRequest(fixture.skillId, 0))); }
	private record Fixture(UUID experienceId, UUID projectId, UUID skillId) {}
}
