package com.ympf.portfolio.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;

import jakarta.servlet.http.Cookie;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import com.ympf.portfolio.auth.domain.RefreshSession;
import com.ympf.portfolio.auth.domain.User;
import com.ympf.portfolio.auth.repository.RefreshSessionRepository;
import com.ympf.portfolio.auth.repository.UserRepository;
import com.ympf.portfolio.support.PostgresTestContainerConfiguration;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Import(PostgresTestContainerConfiguration.class)
@SpringBootTest(properties = {
		"app.auth.jwt-secret=integration-test-secret-with-at-least-32-bytes",
		"app.auth.issuer=ym-pf-test",
		"app.auth.audience=ym-pf-admin-test",
		"app.auth.access-token-ttl=PT5M",
		"app.auth.refresh-token-ttl=P1D",
		"app.auth.cookie-secure=true",
		"app.auth.cookie-same-site=Strict",
		"app.auth.admin-email=admin@example.com",
		"app.auth.admin-password=StrongPassword!2026",
		"app.web.allowed-origins=https://admin.example.com"
})
@AutoConfigureMockMvc
class AuthIntegrationTest {

	private static final String ACCESS_COOKIE = "ympf_access";
	private static final String REFRESH_COOKIE = "ympf_refresh";

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private ObjectMapper objectMapper;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private RefreshSessionRepository refreshSessionRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void clearSessions() {
		refreshSessionRepository.deleteAll();
	}

	@Test
	void bootstrapsExactlyOneBcryptCostTwelveAdministrator() {
		List<User> users = userRepository.findAll();
		assertEquals(1, users.size());
		User admin = users.getFirst();
		assertEquals("admin@example.com", admin.getEmail());
		assertEquals("ADMIN", admin.getRole().name());
		assertTrue(admin.isEnabled());
		assertTrue(passwordEncoder.matches("StrongPassword!2026", admin.getPasswordHash()));
		assertTrue(admin.getPasswordHash().matches("^\\$2[aby]\\$12\\$.*"));
	}

	@Test
	void flywayCreatesPostgresAuthSchemaAndIndexes() {
		Integer migrationCount = jdbcTemplate.queryForObject(
				"select count(*) from flyway_schema_history where version = '1' and success", Integer.class);
		String idType = jdbcTemplate.queryForObject(
				"select data_type from information_schema.columns "
						+ "where table_schema = 'public' and table_name = 'users' and column_name = 'id'",
				String.class);
		String expiryType = jdbcTemplate.queryForObject(
				"select data_type from information_schema.columns "
						+ "where table_schema = 'public' and table_name = 'refresh_sessions' "
						+ "and column_name = 'expires_at'",
				String.class);
		Integer activeIndexCount = jdbcTemplate.queryForObject(
				"select count(*) from pg_indexes where schemaname = 'public' "
						+ "and indexname = 'idx_refresh_sessions_active_user'",
				Integer.class);

		assertEquals(1, migrationCount);
		assertEquals("uuid", idType);
		assertEquals("timestamp with time zone", expiryType);
		assertEquals(1, activeIndexCount);
	}

	@Test
	void csrfEndpointIssuesReadableSecureCookieAndMutationsRequireIt() throws Exception {
		MvcResult csrfResult = mockMvc.perform(get("/api/auth/csrf"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.headerName").value("X-XSRF-TOKEN"))
				.andExpect(jsonPath("$.token").isNotEmpty())
				.andReturn();
		Cookie csrfCookie = csrfResult.getResponse().getCookie("XSRF-TOKEN");
		assertNotNull(csrfCookie);
		assertFalse(csrfCookie.isHttpOnly());
		assertTrue(csrfCookie.getSecure());
		assertEquals("/", csrfCookie.getPath());
		assertEquals("Strict", csrfCookie.getAttribute("SameSite"));

		mockMvc.perform(post("/api/auth/login")
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson("admin@example.com", "StrongPassword!2026")))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_INVALID"));
	}

	@Test
	void loginFailuresAreGeneralizedAndLongBcryptInputIsHandled() throws Exception {
		MvcResult unknown = login("nobody@example.com", "StrongPassword!2026", 401);
		MvcResult wrongPassword = login("admin@example.com", "WrongPassword!2026", 401);
		String longUnicodePassword = "한".repeat(30);
		MvcResult tooLongForBcrypt = login("admin@example.com", longUnicodePassword, 401);

		JsonNode unknownBody = readBody(unknown);
		JsonNode wrongBody = readBody(wrongPassword);
		JsonNode longBody = readBody(tooLongForBcrypt);
		assertEquals("AUTHENTICATION_FAILED", unknownBody.get("code").textValue());
		assertEquals(unknownBody.get("code"), wrongBody.get("code"));
		assertEquals(unknownBody.get("message"), wrongBody.get("message"));
		assertEquals(unknownBody.get("code"), longBody.get("code"));
		assertEquals(unknownBody.get("message"), longBody.get("message"));
	}

	@Test
	void loginSetsHardenedCookiesAndAuthorizesMeAndAdminOnly() throws Exception {
		MvcResult login = login("admin@example.com", "StrongPassword!2026", 200);
		String accessHeader = setCookieHeader(login, ACCESS_COOKIE);
		String refreshHeader = setCookieHeader(login, REFRESH_COOKIE);
		assertCookieAttributes(accessHeader, "/");
		assertCookieAttributes(refreshHeader, "/api/auth");
		Cookie accessCookie = cookieFromHeader(accessHeader, ACCESS_COOKIE);

		JsonNode jwtClaims = decodeJwtClaims(accessCookie.getValue());
		assertEquals("ym-pf-test", jwtClaims.get("iss").textValue());
		assertEquals("ym-pf-admin-test", jwtClaims.get("aud").textValue());
		assertEquals("ADMIN", jwtClaims.get("role").textValue());
		assertEquals("access", jwtClaims.get("typ").textValue());
		assertNotNull(jwtClaims.get("sub"));
		assertNotNull(jwtClaims.get("jti"));
		assertTrue(jwtClaims.get("exp").longValue() > jwtClaims.get("iat").longValue());

		mockMvc.perform(get("/api/auth/me").cookie(accessCookie))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.email").value("admin@example.com"))
				.andExpect(jsonPath("$.role").value("ADMIN"))
				.andExpect(jsonPath("$.user").doesNotExist());
		mockMvc.perform(get("/api/admin/auth-check"))
				.andExpect(status().isUnauthorized())
				.andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
		mockMvc.perform(get("/api/admin/auth-check").cookie(accessCookie))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("ok"));
		mockMvc.perform(get("/api/admin/auth-check").with(user("reader").roles("USER")))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("ACCESS_DENIED"));
		mockMvc.perform(post("/api/admin/auth-check").cookie(accessCookie))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_INVALID"));

		CsrfPair csrf = csrf();
		mockMvc.perform(post("/api/admin/auth-check")
						.cookie(accessCookie, csrf.cookie())
						.header(csrf.headerName(), csrf.token()))
				.andExpect(status().isOk());
	}

	@Test
	void disabledDatabaseUserCannotReusePreviouslyIssuedAccessToken() throws Exception {
		MvcResult login = login("admin@example.com", "StrongPassword!2026", 200);
		Cookie accessCookie = cookieFromHeader(setCookieHeader(login, ACCESS_COOKIE), ACCESS_COOKIE);
		User admin = userRepository.findAll().getFirst();
		admin.disable(Instant.now());
		userRepository.saveAndFlush(admin);
		try {
			mockMvc.perform(get("/api/auth/me").cookie(accessCookie))
					.andExpect(status().isUnauthorized())
					.andExpect(jsonPath("$.code").value("AUTHENTICATION_REQUIRED"));
		}
		finally {
			admin.enable(Instant.now());
			userRepository.saveAndFlush(admin);
		}
	}

	@Test
	void refreshStoresOnlyHashRotatesOnceAndRejectsReplay() throws Exception {
		MvcResult login = login("admin@example.com", "StrongPassword!2026", 200);
		String firstRawToken = cookieFromHeader(setCookieHeader(login, REFRESH_COOKIE), REFRESH_COOKIE).getValue();
		String firstHash = sha256(firstRawToken);
		RefreshSession firstSession = refreshSessionRepository.findByTokenHash(firstHash).orElseThrow();
		assertNotEquals(firstRawToken, firstSession.getTokenHash());
		assertEquals(64, firstSession.getTokenHash().length());
		mockMvc.perform(post("/api/auth/refresh")
						.cookie(new Cookie(REFRESH_COOKIE, firstRawToken)))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_INVALID"));

		MvcResult refreshed = refresh(firstRawToken, 200);
		String secondRawToken = cookieFromHeader(
				setCookieHeader(refreshed, REFRESH_COOKIE), REFRESH_COOKIE).getValue();
		assertNotEquals(firstRawToken, secondRawToken);
		assertNotNull(refreshSessionRepository.findByTokenHash(firstHash).orElseThrow().getRevokedAt());
		assertTrue(refreshSessionRepository.findByTokenHash(sha256(secondRawToken)).isPresent());

		refresh(firstRawToken, 401);
	}

	@Test
	void logoutRevokesRefreshAndClearsCookiesWithMatchingAttributes() throws Exception {
		MvcResult login = login("admin@example.com", "StrongPassword!2026", 200);
		String rawToken = cookieFromHeader(setCookieHeader(login, REFRESH_COOKIE), REFRESH_COOKIE).getValue();
		mockMvc.perform(post("/api/auth/logout")
						.cookie(new Cookie(REFRESH_COOKIE, rawToken)))
				.andExpect(status().isForbidden())
				.andExpect(jsonPath("$.code").value("CSRF_INVALID"));
		CsrfPair csrf = csrf();
		MvcResult logout = mockMvc.perform(post("/api/auth/logout")
						.cookie(new Cookie(REFRESH_COOKIE, rawToken), csrf.cookie())
						.header(csrf.headerName(), csrf.token()))
				.andExpect(status().isNoContent())
				.andReturn();

		String clearAccess = setCookieHeader(logout, ACCESS_COOKIE);
		String clearRefresh = setCookieHeader(logout, REFRESH_COOKIE);
		assertCookieAttributes(clearAccess, "/");
		assertCookieAttributes(clearRefresh, "/api/auth");
		assertTrue(clearAccess.contains("Max-Age=0"));
		assertTrue(clearRefresh.contains("Max-Age=0"));
		assertNotNull(refreshSessionRepository.findByTokenHash(sha256(rawToken)).orElseThrow().getRevokedAt());
		refresh(rawToken, 401);
	}

	@Test
	void corsAllowsOnlyConfiguredExactOriginWithCredentials() throws Exception {
		mockMvc.perform(options("/api/auth/login")
						.header(HttpHeaders.ORIGIN, "https://admin.example.com")
						.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
						.header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "X-XSRF-TOKEN"))
				.andExpect(status().isOk())
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "https://admin.example.com"))
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"))
				.andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_HEADERS, "X-XSRF-TOKEN"));

		mockMvc.perform(options("/api/auth/login")
						.header(HttpHeaders.ORIGIN, "https://evil.example.com")
						.header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST"))
				.andExpect(status().isForbidden())
				.andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
	}

	private MvcResult login(String email, String password, int expectedStatus) throws Exception {
		CsrfPair csrf = csrf();
		return mockMvc.perform(post("/api/auth/login")
						.cookie(csrf.cookie())
						.header(csrf.headerName(), csrf.token())
						.contentType(MediaType.APPLICATION_JSON)
						.content(loginJson(email, password)))
				.andExpect(status().is(expectedStatus))
				.andReturn();
	}

	private MvcResult refresh(String rawToken, int expectedStatus) throws Exception {
		CsrfPair csrf = csrf();
		return mockMvc.perform(post("/api/auth/refresh")
						.cookie(new Cookie(REFRESH_COOKIE, rawToken), csrf.cookie())
						.header(csrf.headerName(), csrf.token()))
				.andExpect(status().is(expectedStatus))
				.andReturn();
	}

	private CsrfPair csrf() throws Exception {
		MvcResult result = mockMvc.perform(get("/api/auth/csrf"))
				.andExpect(status().isOk())
				.andReturn();
		JsonNode body = readBody(result);
		return new CsrfPair(
				body.get("headerName").textValue(),
				body.get("token").textValue(),
				cookieFromHeader(setCookieHeader(result, "XSRF-TOKEN"), "XSRF-TOKEN"));
	}

	private JsonNode readBody(MvcResult result) {
		return objectMapper.readTree(result.getResponse().getContentAsByteArray());
	}

	private JsonNode decodeJwtClaims(String token) {
		String payload = token.split("\\.")[1];
		return objectMapper.readTree(Base64.getUrlDecoder().decode(payload));
	}

	private String loginJson(String email, String password) {
		return objectMapper.writeValueAsString(java.util.Map.of("email", email, "password", password));
	}

	private String setCookieHeader(MvcResult result, String cookieName) {
		return result.getResponse().getHeaders(HttpHeaders.SET_COOKIE).stream()
				.filter(header -> header.startsWith(cookieName + "="))
				.findFirst()
				.orElseThrow(() -> new AssertionError("Missing Set-Cookie for " + cookieName));
	}

	private Cookie cookieFromHeader(String header, String cookieName) {
		String value = header.substring(cookieName.length() + 1, header.indexOf(';'));
		return new Cookie(cookieName, value);
	}

	private void assertCookieAttributes(String header, String path) {
		assertTrue(header.contains("HttpOnly") || header.startsWith("XSRF-TOKEN="));
		assertTrue(header.contains("Secure"));
		assertTrue(header.contains("Path=" + path));
		assertTrue(header.contains("SameSite=Strict"), header);
	}

	private String sha256(String value) throws Exception {
		return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
				.digest(value.getBytes(StandardCharsets.UTF_8)));
	}

	private record CsrfPair(String headerName, String token, Cookie cookie) {
	}
}
