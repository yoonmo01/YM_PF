package com.ympf.portfolio.media;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import com.ympf.portfolio.common.exception.ApiException;
import com.ympf.portfolio.media.MediaDtos.MediaMetadataRequest;
import com.ympf.portfolio.media.MediaDtos.ProjectMediaRequest;
import com.ympf.portfolio.portfolio.PortfolioDtos.SkillRequest;
import com.ympf.portfolio.portfolio.PortfolioService;
import com.ympf.portfolio.project.ProjectDtos.ProblemSolutionRequest;
import com.ympf.portfolio.project.ProjectDtos.ProjectRequest;
import com.ympf.portfolio.project.ProjectProblemSolutionRepository;
import com.ympf.portfolio.project.ProjectRepository;
import com.ympf.portfolio.project.ProjectService;
import com.ympf.portfolio.project.ProjectSkillRepository;
import com.ympf.portfolio.skill.SkillCategory;
import com.ympf.portfolio.skill.SkillRepository;
import com.ympf.portfolio.support.PostgresTestContainerConfiguration;

@SpringBootTest(properties = {
		"app.auth.jwt-secret=test-secret-that-is-at-least-thirty-two-bytes",
		"app.auth.issuer=media-test", "app.auth.audience=media-test", "app.auth.access-token-ttl=PT5M",
		"app.auth.refresh-token-ttl=P1D", "app.auth.access-cookie-name=test_access",
		"app.auth.refresh-cookie-name=test_refresh", "app.auth.access-cookie-path=/",
		"app.auth.refresh-cookie-path=/api/auth", "app.auth.cookie-secure=false",
		"app.auth.cookie-same-site=Lax", "app.auth.admin-email=admin@example.com",
		"app.auth.admin-password=test-password", "app.web.allowed-origins=http://localhost:3000",
		"app.media.provider=local"
})
@AutoConfigureMockMvc
@Import(PostgresTestContainerConfiguration.class)
class MediaIntegrationTest {
	private static final Path STORAGE_ROOT = createTempDirectory();
	@DynamicPropertySource static void mediaProperties(DynamicPropertyRegistry registry) { registry.add("app.media.local-path", STORAGE_ROOT::toString); }
	@Autowired MediaService media; @Autowired PortfolioService portfolio; @Autowired ProjectService projects;
	@Autowired ProjectMediaRepository projectMedia; @Autowired MediaFileRepository mediaFiles;
	@Autowired ProjectSkillRepository projectSkills; @Autowired ProjectProblemSolutionRepository problemSolutions;
	@Autowired ProjectRepository projectRepository; @Autowired SkillRepository skills; @Autowired MockMvc mockMvc;

	@BeforeEach void clean() { projectMedia.deleteAll(); problemSolutions.deleteAll(); projectSkills.deleteAll(); projectRepository.deleteAll(); mediaFiles.deleteAll(); skills.deleteAll(); }

	@Test
	void validatesMagicMimeExtensionDimensionsAndMetadata() throws Exception {
		byte[] png = png();
		assertThatThrownBy(() -> media.upload(new MockMultipartFile("file", "spoof.jpg", "image/jpeg", png), "대체 텍스트", null))
				.isInstanceOf(ApiException.class).extracting("code").isEqualTo("MEDIA_TYPE_INVALID");
		var uploaded = media.upload(new MockMultipartFile("file", "cover.png", "image/png", png), "표지 설명", "선택 캡션");
		assertThat(uploaded.width()).isEqualTo(2); assertThat(uploaded.height()).isEqualTo(1);
		assertThat(uploaded.originalName()).isEqualTo("cover.png"); assertThat(uploaded.url()).contains("/api/admin/media/");
		var updated = media.update(uploaded.id(), new MediaMetadataRequest("새 설명", null));
		assertThat(updated.altText()).isEqualTo("새 설명");
		mockMvc.perform(multipart("/api/admin/media").file(new MockMultipartFile("file", "x.png", "image/png", png))
					.param("altText", "<img src=x>").with(user("admin").roles("ADMIN")).with(csrf()))
				.andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("VALIDATION_FAILED"));
	}

	@Test
	void attachedMediaIsPublicOnlyForPublishedProjectAndCannotBeDeletedWhileUsed() throws Exception {
		UUID skillId = portfolio.createSkill(new SkillRequest("Java", SkillCategory.BACKEND, 0, true)).id();
		UUID projectId = projects.create(completeProject(skillId)).id();
		var uploaded = media.upload(new MockMultipartFile("file", "cover.png", "image/png", png()), "프로젝트 표지", null);
		var attached = media.attach(projectId, new ProjectMediaRequest(uploaded.id(), MediaRole.COVER, 0));
		mockMvc.perform(get("/api/public/media/{id}/content", uploaded.id())).andExpect(status().isNotFound());
		projects.publish(projectId);
		mockMvc.perform(get("/api/public/media/{id}/content", uploaded.id())).andExpect(status().isOk())
				.andExpect(content().contentType(MediaType.IMAGE_PNG)).andExpect(content().bytes(png()));
		mockMvc.perform(get("/api/public/projects/media-project")).andExpect(status().isOk())
				.andExpect(jsonPath("$.media[0].mediaRole").value("COVER"))
				.andExpect(jsonPath("$.media[0].altText").value("프로젝트 표지"))
				.andExpect(jsonPath("$.media[0].mediaId").doesNotExist());
		assertThatThrownBy(() -> media.delete(uploaded.id())).isInstanceOf(ApiException.class).extracting("code").isEqualTo("MEDIA_IN_USE");
		media.detach(projectId, attached.id()); media.delete(uploaded.id());
		mockMvc.perform(get("/api/admin/media/{id}/content", uploaded.id()).with(user("admin").roles("ADMIN")))
				.andExpect(status().isNotFound());
	}

	private ProjectRequest completeProject(UUID skillId) { return new ProjectRequest("Media Project", "media-project", "요약", "배경", "문제", "목표", "백엔드", "담당 업무", "핵심 구현", "기술 선택", "검증 결과", "한계", "회고", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 2, 1), 1, "https://github.com/example/media", "https://example.com", true, 0, List.of(skillId), List.of(new ProblemSolutionRequest("문제", "원인", "해결", "검증"))); }
	private static byte[] png() throws Exception { BufferedImage image = new BufferedImage(2, 1, BufferedImage.TYPE_INT_RGB); ByteArrayOutputStream output = new ByteArrayOutputStream(); ImageIO.write(image, "png", output); return output.toByteArray(); }
	private static Path createTempDirectory() { try { return Files.createTempDirectory("ympf-media-test-"); } catch (Exception exception) { throw new ExceptionInInitializerError(exception); } }
}
