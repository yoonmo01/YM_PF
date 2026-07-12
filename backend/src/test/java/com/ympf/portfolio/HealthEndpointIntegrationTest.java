package com.ympf.portfolio;

import com.ympf.portfolio.support.PostgresTestContainerConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(PostgresTestContainerConfiguration.class)
@SpringBootTest(properties = {
		"app.auth.jwt-secret=health-test-only-secret-with-at-least-32-bytes",
		"app.auth.cookie-secure=false"
})
@AutoConfigureMockMvc
class HealthEndpointIntegrationTest {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void actuatorHealthReportsUp() throws Exception {
		mockMvc.perform(get("/actuator/health"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("UP"));
	}
}
