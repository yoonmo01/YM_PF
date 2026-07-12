package com.ympf.portfolio.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements ApplicationRunner {

	private static final Logger LOGGER = LoggerFactory.getLogger(AdminBootstrapRunner.class);

	private final AdminBootstrapService bootstrapService;

	public AdminBootstrapRunner(AdminBootstrapService bootstrapService) {
		this.bootstrapService = bootstrapService;
	}

	@Override
	public void run(ApplicationArguments args) {
		if (bootstrapService.bootstrapIfNecessary()) {
			LOGGER.info("Initial administrator account created");
		}
	}
}
