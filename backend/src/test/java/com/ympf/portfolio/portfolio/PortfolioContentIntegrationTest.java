package com.ympf.portfolio.portfolio;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors;
import org.springframework.test.web.servlet.MockMvc;

import com.ympf.portfolio.auth.repository.UserRepository;
import com.ympf.portfolio.portfolio.PortfolioDtos.CertificateRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.EducationRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.ExperienceRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.ProfileRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.SkillRequest;
import com.ympf.portfolio.project.ProjectDtos.ProblemSolutionRequest;
import com.ympf.portfolio.project.ProjectDtos.ProjectRequest;
import com.ympf.portfolio.project.ProjectService;
import com.ympf.portfolio.skill.SkillCategory;
import com.ympf.portfolio.support.PostgresTestContainerConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(PostgresTestContainerConfiguration.class)
@SpringBootTest(properties = {
		"app.auth.jwt-secret=portfolio-test-secret-with-at-least-32-bytes",
		"app.auth.cookie-secure=false",
		"app.auth.admin-email=admin@example.com",
		"app.auth.admin-password=StrongPassword!2026"
})
@AutoConfigureMockMvc
class PortfolioContentIntegrationTest {

	@Autowired private PortfolioService portfolio;
	@Autowired private ProjectService projects;
	@Autowired private UserRepository users;
	@Autowired private JdbcTemplate jdbcTemplate;
	@Autowired private MockMvc mockMvc;
	@Autowired private ObjectMapper objectMapper;

	@BeforeEach
	void cleanContent() {
		jdbcTemplate.update("delete from project_problem_solutions");
		jdbcTemplate.update("delete from project_skills");
		jdbcTemplate.update("delete from projects");
		jdbcTemplate.update("delete from profiles");
		jdbcTemplate.update("delete from experiences");
		jdbcTemplate.update("delete from educations");
		jdbcTemplate.update("delete from certificates");
		jdbcTemplate.update("delete from skills");
	}

	@Test
	void flywayV2AndSimpleContentCrudWorkWithValidation() throws Exception {
		Integer migrated = jdbcTemplate.queryForObject(
				"select count(*) from flyway_schema_history where version = '2' and success", Integer.class);
		assertEquals(1, migrated);

		UUID userId = users.findAll().getFirst().getId();
		assertNotNull(portfolio.upsertProfile(userId, new ProfileRequest(
				"양윤모", "Backend Developer", "한 줄 소개", "긴 소개", "admin@example.com",
				"https://github.com/example", null)));
		portfolio.createExperience(new ExperienceRequest("조직", "개발자", "설명",
				LocalDate.of(2024, 1, 1), null, true, 0));
		portfolio.createEducation(new EducationRequest("학교", "과정", "설명",
				LocalDate.of(2020, 3, 1), LocalDate.of(2024, 2, 1), 0));
		portfolio.createCertificate(new CertificateRequest("자격증", "기관", LocalDate.of(2025, 1, 1),
				null, "https://example.com/credential", "PASS", 0));
		portfolio.createSkill(new SkillRequest("Java", SkillCategory.BACKEND, 0, true));
		assertEquals(1, portfolio.experiences().size());
		assertEquals(1, portfolio.educations().size());
		assertEquals(1, portfolio.certificates().size());
		assertEquals(1, portfolio.skills(true).size());

		mockMvc.perform(post("/api/admin/skills")
						.with(user("admin").roles("ADMIN"))
						.with(csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content(objectMapper.writeValueAsString(Map.of(
								"name", "<script>", "category", "BACKEND", "displayOrder", 0, "visible", true))))
				.andExpect(status().isBadRequest())
				.andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
	}

	@Test
	void onlyPublishedProjectsArePublicAndDtosDoNotExposeAdminFields() throws Exception {
		UUID skillId = portfolio.createSkill(new SkillRequest("Spring Boot", SkillCategory.BACKEND, 0, true)).id();
		ProjectRequest request = completeProject("portfolio-hub", skillId);
		UUID id = projects.create(request).id();

		mockMvc.perform(get("/api/public/projects"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content.length()").value(0));
		mockMvc.perform(get("/api/public/projects/portfolio-hub"))
				.andExpect(status().isNotFound());

		projects.publish(id);
		mockMvc.perform(get("/api/public/projects"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].slug").value("portfolio-hub"))
				.andExpect(jsonPath("$.content[0].id").doesNotExist())
				.andExpect(jsonPath("$.content[0].skills[0].id").doesNotExist())
				.andExpect(jsonPath("$.content[0].status").doesNotExist());
		mockMvc.perform(get("/api/public/projects/portfolio-hub"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.problemSolutions[0].verification").value("통합 테스트 통과"))
				.andExpect(jsonPath("$.problemSolutions[0].id").doesNotExist())
				.andExpect(jsonPath("$.problemSolutions[0].displayOrder").doesNotExist())
				.andExpect(jsonPath("$.createdAt").doesNotExist());

		projects.archive(id);
		mockMvc.perform(get("/api/public/projects/portfolio-hub"))
				.andExpect(status().isNotFound());
	}

	@Test
	void adminBoundaryAndCsrfRemainEnforcedForContentApis() throws Exception {
		mockMvc.perform(get("/api/admin/projects"))
				.andExpect(status().isUnauthorized());
		mockMvc.perform(post("/api/admin/projects")
						.with(user("admin").roles("ADMIN"))
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_INVALID"));
		mockMvc.perform(post("/api/public/projects")
						.with(SecurityMockMvcRequestPostProcessors.csrf())
						.contentType(MediaType.APPLICATION_JSON)
						.content("{}"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
	}

	private ProjectRequest completeProject(String slug, UUID skillId) {
		return new ProjectRequest("Portfolio Hub", slug, "요약", "배경", "문제", "목표", "백엔드",
				"담당 업무", "핵심 구현", "기술 선택", "검증 결과", "한계", "회고",
				LocalDate.of(2026, 1, 1), LocalDate.of(2026, 6, 1), 1,
				"https://github.com/example/project", "https://example.com", true, 0,
				List.of(skillId), List.of(new ProblemSolutionRequest("문제", "원인", "해결", "통합 테스트 통과")));
	}
}
