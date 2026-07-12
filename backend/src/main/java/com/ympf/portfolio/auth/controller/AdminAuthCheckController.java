package com.ympf.portfolio.auth.controller;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.auth.security.AuthenticatedUser;

@RestController
@RequestMapping("/api/admin/auth-check")
public class AdminAuthCheckController {

	@GetMapping
	public AdminAuthCheckResponse check(@AuthenticationPrincipal AuthenticatedUser user) {
		return new AdminAuthCheckResponse("ok", user.id());
	}

	@PostMapping
	public AdminAuthCheckResponse mutationCheck(@AuthenticationPrincipal AuthenticatedUser user) {
		return new AdminAuthCheckResponse("ok", user.id());
	}

	public record AdminAuthCheckResponse(String status, java.util.UUID userId) {
	}
}
