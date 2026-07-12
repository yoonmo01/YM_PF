package com.ympf.portfolio;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.ympf.portfolio.support.PostgresTestContainerConfiguration;

@SpringBootTest(properties = {
		"app.auth.jwt-secret=test-secret-that-is-at-least-thirty-two-bytes", "app.auth.issuer=openapi-test",
		"app.auth.audience=openapi-test", "app.auth.access-token-ttl=PT5M", "app.auth.refresh-token-ttl=P1D",
		"app.auth.access-cookie-name=test_access", "app.auth.refresh-cookie-name=test_refresh",
		"app.auth.access-cookie-path=/", "app.auth.refresh-cookie-path=/api/auth", "app.auth.cookie-secure=false",
		"app.auth.cookie-same-site=Lax", "app.auth.admin-email=", "app.auth.admin-password=",
		"app.web.allowed-origins=http://localhost:3000", "app.media.provider=local",
		"app.media.local-path=${java.io.tmpdir}/ympf-openapi-media"
})
@AutoConfigureMockMvc
@Import(PostgresTestContainerConfiguration.class)
class OpenApiIntegrationTest {
	@Autowired MockMvc mockMvc;

	@Test
	void documentsImplementedApisWithoutInventingPublicResumeRoutes() throws Exception {
		mockMvc.perform(get("/v3/api-docs")).andExpect(status().isOk())
				.andExpect(jsonPath("$.paths['/api/public/projects']").exists())
				.andExpect(jsonPath("$.paths['/api/admin/media']").exists())
				.andExpect(jsonPath("$.paths['/api/admin/resumes']").exists())
				.andExpect(jsonPath("$.paths['/api/admin/resumes/{id}/pdf']").exists())
				.andExpect(jsonPath("$.paths['/api/public/resumes']").doesNotExist());
	}
}
