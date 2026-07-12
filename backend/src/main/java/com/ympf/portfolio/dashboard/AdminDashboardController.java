package com.ympf.portfolio.dashboard;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ympf.portfolio.dashboard.DashboardDtos.DashboardResponse;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

	private final DashboardService service;

	public AdminDashboardController(DashboardService service) { this.service = service; }

	@GetMapping
	public DashboardResponse dashboard() { return service.dashboard(); }
}
